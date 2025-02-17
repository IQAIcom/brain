import {
	type IAgentRuntime,
	Service,
	ServiceType,
	elizaLogger,
} from "@elizaos/core";
import { type Account, connect } from "near-api-js";
import * as cron from "node-cron";
import type { AgentEvent, NearAgentConfig, NearEventListener } from "../types";

export class NearAgent extends Service {
	static serviceType: ServiceType = ServiceType.TRANSCRIPTION;
	private static readonly DEFAULT_NETWORK_ID = "mainnet";
	private static readonly DEFAULT_NODE_URL = "https://1rpc.io/near";
	private static readonly DEFAULT_GAS_LIMIT = "200000000000000";
	private static readonly DEFAULT_CRON_EXPRESSION = "*/10 * * * * *";
	private static readonly DEFAULT_RESPONSE_METHOD = "agent_response";

	private account: Account;
	private lastBlockHeight = 0;

	constructor(private readonly opts: NearAgentConfig) {
		super();
	}

	async initialize(_runtime: IAgentRuntime) {
		const near = await connect({
			networkId:
				this.opts.networkConfig?.networkId || NearAgent.DEFAULT_NETWORK_ID,
			nodeUrl: this.opts.networkConfig?.nodeUrl || NearAgent.DEFAULT_NODE_URL,
		});

		this.account = await near.account(this.opts.accountId);

		for (const listener of this.opts.listeners) {
			cron.schedule(
				listener.cronExpression || NearAgent.DEFAULT_CRON_EXPRESSION,
				() => this.pollEvents(listener),
			);
		}

		elizaLogger.info("🤖 NEAR Agent service initialized with polling");
	}
	private async pollEvents(listener: NearEventListener) {
		elizaLogger.info(
			`ℹ️ Polling for ${listener.eventName} event from contract: ${listener.contractId}`,
		);
		try {
			const currentBlock = await this.account.connection.provider.block({
				finality: "final",
			});
			const currentHeight = currentBlock.header.height;

			if (this.lastBlockHeight === 0) {
				this.lastBlockHeight = currentHeight - 1;
			}

			const blockDetails = await this.account.connection.provider.block({
				blockId: currentHeight,
			});

			for (const chunk of blockDetails.chunks) {
				const chunkDetails = await this.account.connection.provider.chunk(
					chunk.chunk_hash,
				);

				const relevantTxs = chunkDetails.transactions.filter(
					(tx) => tx.receiver_id === listener.contractId,
				);

				for (const tx of relevantTxs) {
					const txStatus = await this.account.connection.provider.txStatus(
						tx.hash,
						listener.contractId,
						"EXECUTED",
					);

					for (const { outcome } of txStatus.receipts_outcome) {
						for (const log of outcome.logs) {
							try {
								const eventData = JSON.parse(log);
								if (eventData.event === listener.eventName) {
									await this.handleEvent(
										{
											eventType: eventData.event,
											requestId: eventData.request_id,
											payload: eventData.data,
											sender: tx.signer_id,
											timestamp: Date.now(),
										},
										listener,
									);
								}
							} catch (error) {
								elizaLogger.error("Failed to parse log", { log, error });
							}
						}
					}
				}
			}

			this.lastBlockHeight = currentHeight;
		} catch (error) {
			elizaLogger.error("Event polling failed", { error });
		}
	}

	private async handleEvent(event: AgentEvent, listener: NearEventListener) {
		try {
			const result = await listener.handler(event.payload, {
				account: this.account,
			});

			await this.account.functionCall({
				contractId: listener.contractId,
				methodName:
					listener.responseMethodName || NearAgent.DEFAULT_RESPONSE_METHOD,
				args: {
					request_id: event.requestId,
					result: result,
				},
				gas: BigInt(this.opts.gasLimit || NearAgent.DEFAULT_GAS_LIMIT),
			});

			elizaLogger.info(`Event ${event.requestId} processed successfully`);
		} catch (error) {
			elizaLogger.error("Event processing failed", { error });
		}
	}
}
