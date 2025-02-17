import {
	type IAgentRuntime,
	Service,
	ServiceType,
	elizaLogger,
} from "@elizaos/core";
import { type Account, connect } from "near-api-js";
import type { AgentEvent, NearAgentConfig, NearEventListener } from "../types";
import axios from "axios";
import * as fs from "node:fs/promises";
import { exists } from "node:fs";
import { promisify } from "node:util";

const existsAsync = promisify(exists);

interface IndexerConfig {
	baseUrl?: string;
	apiKey?: string;
	blocksPerBatch?: number;
	resetBlockIdOnStart?: boolean;
}

export class NearAgent extends Service {
	static serviceType: ServiceType = ServiceType.TRANSCRIPTION;
	private static readonly DEFAULT_NETWORK_ID = "mainnet";
	private static readonly DEFAULT_NODE_URL = "https://1rpc.io/near";
	private static readonly DEFAULT_GAS_LIMIT = "200000000000000";
	private static readonly DEFAULT_RESPONSE_METHOD = "agent_response";
	private static readonly BLOCK_ID_FILE = "last_block_id.txt";
	private static readonly DEFAULT_BLOCKS_PER_BATCH = 2;

	private account: Account;
	private indexerConfig: Required<IndexerConfig>;
	private isProcessing = false;

	constructor(private readonly opts: NearAgentConfig) {
		super();
		this.indexerConfig = {
			baseUrl:
				opts.indexerConfig?.baseUrl || "https://mainnet.neardata.xyz/v0/block/",
			apiKey: opts.indexerConfig?.apiKey || "",
			blocksPerBatch:
				opts.indexerConfig?.blocksPerBatch ||
				NearAgent.DEFAULT_BLOCKS_PER_BATCH,
			resetBlockIdOnStart: opts.indexerConfig?.resetBlockIdOnStart || false,
		};
	}

	async initialize(_runtime: IAgentRuntime) {
		const near = await connect({
			networkId:
				this.opts.networkConfig?.networkId || NearAgent.DEFAULT_NETWORK_ID,
			nodeUrl: this.opts.networkConfig?.nodeUrl || NearAgent.DEFAULT_NODE_URL,
		});

		this.account = await near.account(this.opts.accountId);

		if (this.indexerConfig.resetBlockIdOnStart) {
			await this.resetBlockId();
		}

		// Start continuous processing
		this.startProcessing();

		elizaLogger.info("🤖 NEAR Agent service initialized with indexer");
	}

	private async startProcessing() {
		if (this.isProcessing) return;
		this.isProcessing = true;

		while (this.isProcessing) {
			try {
				await this.processBlocksBatch();
				// Small delay to prevent overwhelming the indexer
				await new Promise((resolve) => setTimeout(resolve, 1000));
			} catch (error) {
				elizaLogger.error("Block processing error", { error });
				await new Promise((resolve) => setTimeout(resolve, 5000));
			}
		}
	}

	private async resetBlockId() {
		if (await existsAsync(NearAgent.BLOCK_ID_FILE)) {
			await fs.unlink(NearAgent.BLOCK_ID_FILE);
			elizaLogger.info(`Reset block ID file: ${NearAgent.BLOCK_ID_FILE}`);
		}
	}

	private async fetchJson(url: string) {
		try {
			const headers: Record<string, string> = {};
			if (this.indexerConfig.apiKey) {
				headers.Authorization = `Bearer ${this.indexerConfig.apiKey}`;
			}

			const response = await axios.get(url, { headers, timeout: 3000 });
			return response.data;
		} catch (error) {
			elizaLogger.error("Fetch error", { error, url });
			return null;
		}
	}

	private async getLatestBlockHeight(): Promise<number> {
		const data = await this.fetchJson("https://api.fastnear.com/status");
		return data?.sync_block_height || 0;
	}

	private async getLastBlockId(): Promise<number> {
		try {
			if (await existsAsync(NearAgent.BLOCK_ID_FILE)) {
				const content = await fs.readFile(NearAgent.BLOCK_ID_FILE, "utf-8");
				return Number.parseInt(content.trim(), 10);
			}
		} catch (error) {
			elizaLogger.error("Error reading last block ID", { error });
		}
		return await this.getLatestBlockHeight();
	}

	private async saveLastBlockId(blockId: number) {
		await fs.writeFile(NearAgent.BLOCK_ID_FILE, blockId.toString());
	}

	private async processBlocksBatch() {
		const startBlockId = await this.getLastBlockId();
		const promises = Array.from(
			{ length: this.indexerConfig.blocksPerBatch },
			(_, i) => this.processBlock(startBlockId + i + 1),
		);

		const results = await Promise.all(promises);
		const successfulBlocks = results.filter((result) => result !== null);

		if (successfulBlocks.length > 0) {
			const maxBlockId = Math.max(...(successfulBlocks as number[]));
			await this.saveLastBlockId(maxBlockId);
			elizaLogger.info(`Processed blocks up to ${maxBlockId}`);
		}
	}

	private async processBlock(blockId: number): Promise<number | null> {
		const data = await this.fetchJson(
			`${this.indexerConfig.baseUrl}${blockId}`,
		);
		if (!data?.shards) return null;

		await this.processShards(data.shards, blockId);
		return blockId;
	}

	private async processShards(shards: any[], _blockId: number) {
		for (const shard of shards) {
			if (!shard.receipt_execution_outcomes) continue;

			for (const outcome of shard.receipt_execution_outcomes) {
				const logs = outcome.execution_outcome?.outcome?.logs || [];
				for (const log of logs) {
					await this.processLog(log, outcome);
				}
			}
		}
	}

	private async processLog(log: string, receipt: any) {
		try {
			// Look for EVENT_JSON format
			const match = log.match(/EVENT_JSON:(.*)$/);
			if (!match) return;

			const eventData = JSON.parse(match[1]);

			// Process for each listener
			for (const listener of this.opts.listeners) {
				if (eventData.event === listener.eventName) {
					await this.handleEvent(
						{
							eventType: eventData.event,
							requestId: eventData.request_id,
							payload: eventData.data,
							sender: receipt.execution_outcome.outcome.executor_id,
							timestamp: Date.now(),
						},
						listener,
					);
				}
			}
		} catch (error) {
			elizaLogger.error("Log processing error", { error, log });
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
