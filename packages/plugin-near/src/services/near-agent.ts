import {
	type IAgentRuntime,
	Service,
	ServiceType,
	elizaLogger,
} from "@elizaos/core";
import { type Account, KeyPair, connect, keyStores } from "near-api-js";
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

	private BLOCK_TO_CHECK = 189_074_446;

	constructor(private readonly opts: NearAgentConfig) {
		super();
		elizaLogger.info(
			`🌟 Initializing NEAR Agent service for account: ${this.opts.accountId}`,
		);
	}

	async initialize(_runtime: IAgentRuntime) {
		elizaLogger.info("🔑 Setting up key store and connecting to NEAR network");
		const keyStore = new keyStores.InMemoryKeyStore();
		const keyPair = KeyPair.fromString(this.opts.accountKey);
		await keyStore.setKey(
			this.opts.networkConfig?.networkId || NearAgent.DEFAULT_NETWORK_ID,
			this.opts.accountId,
			keyPair,
		);

		elizaLogger.info("🌐 Establishing connection to NEAR network");
		const near = await connect({
			networkId:
				this.opts.networkConfig?.networkId || NearAgent.DEFAULT_NETWORK_ID,
			nodeUrl: this.opts.networkConfig?.nodeUrl || NearAgent.DEFAULT_NODE_URL,
			keyStore,
		});

		this.account = await near.account(this.opts.accountId);

		elizaLogger.info("⏰ Setting up event listeners with cron schedules");
		for (const listener of this.opts.listeners) {
			cron.schedule(
				listener.cronExpression || NearAgent.DEFAULT_CRON_EXPRESSION,
				() => this.pollEvents(listener),
			);
		}

		elizaLogger.info("🤖 NEAR Agent service initialized with polling");
	}

	private async pollEvents(listener: NearEventListener) {
		elizaLogger.info("🔄 Polling for events");
		try {
			const currentBlock = await this.getCurrentBlock();
			if (!currentBlock) return;

			const relevantItems = await this.getRelevantItems(
				currentBlock,
				listener.contractId,
			);
			elizaLogger.info(
				`🌟 Found ${relevantItems.length} relevant items (receipts/transactions)`,
			);
			await this.processItems(relevantItems, listener);

			this.lastBlockHeight = currentBlock.header.height;
		} catch (error) {
			elizaLogger.error("Event polling failed", { error });
		}
	}

	private async getCurrentBlock() {
		// const currentBlock = await this.account.connection.provider.block({
		//     finality: "final",
		// });
		// if (this.lastBlockHeight === 0) {
		//     this.lastBlockHeight = currentBlock.header.height - 1;
		// }
		// return currentBlock;

		return { header: { height: this.BLOCK_TO_CHECK } };
	}

	private async getRelevantItems(block: any, contractId: string) {
		const relevantItems = [];
		const blockDetails = await this.account.connection.provider.block({
			blockId: block.header.height,
		});

		for (const chunk of blockDetails.chunks) {
			const chunkDetails = await this.account.connection.provider.chunk(
				chunk.chunk_hash,
			);

			// Process receipts
			for (const receipt of chunkDetails.receipts) {
				if (receipt.receiver_id === contractId) {
					relevantItems.push({
						type: "receipt",
						data: receipt,
						receiver_id: receipt.receiver_id,
						receipt_id: receipt.receipt_id,
						predecessor_id: receipt.predecessor_id,
					});
				}
			}

			// We no longer process transactions directly
		}

		elizaLogger.info(
			`🌟 Found ${relevantItems.length} relevant items (receipts)`,
		);
		return relevantItems;
	}

	private async processItems(items: any[], listener: NearEventListener) {
		for (const item of items) {
			if (item.type === "receipt") {
				const events = await this.extractEventsFromReceipt(item.data, listener);
				for (const event of events) {
					await this.handleEvent(event, listener);
				}
			}
		}
	}

	/**
	 * Extracts events from a receipt using NearBlocks API to get the transaction hash
	 * @param receipt - The receipt object.
	 * @param listener - The listener object.
	 * @returns An array of events.
	 */
	private async extractEventsFromReceipt(
		receipt: any,
		listener: NearEventListener,
	) {
		const events = [];

		try {
			// Use NearBlocks API to get the transaction hash from receipt ID
			const networkId =
				this.opts.networkConfig?.networkId || NearAgent.DEFAULT_NETWORK_ID;
			const apiUrl =
				networkId === "mainnet"
					? "https://api.nearblocks.io/v1/search"
					: "https://api-testnet.nearblocks.io/v1/search";

			const response = await fetch(`${apiUrl}?keyword=${receipt.receipt_id}`);
			const data = await response.json();

			if (data.receipts && data.receipts.length > 0) {
				const txHash = data.receipts[0].originated_from_transaction_hash;

				if (txHash) {
					// Get transaction details and extract logs
					const txStatus = await this.account.connection.provider.txStatus(
						txHash,
						listener.contractId,
						"EXECUTED",
					);

					for (const { outcome } of txStatus.receipts_outcome) {
						for (const log of outcome.logs) {
							const event = this.parseEventLog(
								log,
								listener.eventName,
								receipt.predecessor_id,
							);
							if (event) events.push(event);
						}
					}
				}
			}
		} catch (error) {
			elizaLogger.error(
				`Failed to extract events from receipt ${receipt.receipt_id}`,
				{ error },
			);
		}

		return events;
	}

	private parseEventLog(
		log: string,
		eventName: string,
		signerId: string,
	): AgentEvent | null {
		try {
			const eventData = JSON.parse(log);
			if (eventData.event === eventName) {
				return {
					eventType: eventData.event,
					requestId: eventData.request_id,
					payload: eventData.data,
					sender: signerId,
					timestamp: Date.now(),
				};
			}
		} catch (error) {
			elizaLogger.error("Failed to parse log", { log, error });
		}
		return null;
	}

	private async handleEvent(event: AgentEvent, listener: NearEventListener) {
		try {
			elizaLogger.info(`🔄 Processing event with ID: ${event.requestId}`);
			const result = await listener.handler(event.payload, {
				account: this.account,
			});

			await this.sendResponse(event.requestId, result, listener);
			elizaLogger.info(`✅ Event ${event.requestId} processed successfully`);
		} catch (error) {
			elizaLogger.error("Event processing failed", { error });
		}
	}

	private async sendResponse(
		requestId: string,
		result: any,
		listener: NearEventListener,
	) {
		elizaLogger.info("📤 Sending response back to contract");
		await this.account.functionCall({
			contractId: listener.contractId,
			methodName:
				listener.responseMethodName || NearAgent.DEFAULT_RESPONSE_METHOD,
			args: { request_id: requestId, result },
			gas: BigInt(this.opts.gasLimit || NearAgent.DEFAULT_GAS_LIMIT),
		});
	}
}
