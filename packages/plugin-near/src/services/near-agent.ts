import {
	type IAgentRuntime,
	Service,
	ServiceType,
	elizaLogger,
} from "@elizaos/core";
import { type Account, connect } from "near-api-js";
import * as cron from "node-cron";
import type { AgentEvent, NearAgentConfig } from "../types";

export class NearAgent extends Service {
	static serviceType: ServiceType = ServiceType.TRANSCRIPTION;
	private account: Account;
	private lastBlockHeight = 0;

	constructor(private readonly opts: NearAgentConfig) {
		super();
	}

	async initialize(_runtime: IAgentRuntime) {
		const near = await connect({
			networkId: this.opts.networkConfig?.networkId || "mainnet",
			nodeUrl:
				this.opts.networkConfig?.nodeUrl || "https://rpc.mainnet.near.org",
		});

		this.account = await near.account(this.opts.accountId);

		// Start polling for events
		cron.schedule("*/10 * * * * *", () => this.pollEvents()); // Every 10 seconds
		elizaLogger.info("🤖 NEAR Agent service initialized with polling");
	}

	private async pollEvents() {
		try {
			const currentBlock = await this.account.connection.provider.block({
				finality: "final",
			});
			const currentHeight = currentBlock.header.height;

			if (this.lastBlockHeight === 0) {
				this.lastBlockHeight = currentHeight - 1;
			}

			// Get block details including chunks
			const blockDetails = await this.account.connection.provider.block({
				blockId: currentHeight,
			});

			// Get chunk details which contain transaction outcomes
			for (const chunk of blockDetails.chunks) {
				const chunkDetails = await this.account.connection.provider.chunk(
					chunk.chunk_hash,
				);

				// Filter transactions for our contract
				const relevantTxs = chunkDetails.transactions.filter(
					(tx) => tx.receiver_id === this.opts.contractId,
				);

				// Get transaction outcomes which contain the logs
				for (const tx of relevantTxs) {
					const txStatus = await this.account.connection.provider.txStatus(
						tx.hash,
						this.opts.contractId,
						"EXECUTED",
					);

					// Process logs from transaction receipts
					for (const { outcome } of txStatus.receipts_outcome) {
						for (const log of outcome.logs) {
							try {
								const eventData = JSON.parse(log);
								if (
									eventData.event &&
									this.opts.eventHandlers[eventData.event]
								) {
									await this.handleEvent({
										eventType: eventData.event,
										requestId: eventData.request_id,
										payload: eventData.data,
										sender: tx.signer_id,
										timestamp: Date.now(),
									});
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

	private async handleEvent(event: AgentEvent) {
		const handler = this.opts.eventHandlers[event.eventType];

		try {
			const result = await handler.handler(event.payload, {
				account: this.account,
			});
			await this.account.functionCall({
				contractId: this.opts.contractId,
				methodName: "agent_response",
				args: {
					request_id: event.requestId,
					result: result,
				},
				gas: BigInt(this.opts.gasLimit || "200000000000000"),
			});

			elizaLogger.info(`Event ${event.requestId} processed successfully`);
		} catch (error) {
			elizaLogger.error("Event processing failed", { error });
		}
	}
}
