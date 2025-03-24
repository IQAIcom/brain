import path from "node:path";
import {
	type Adapter,
	AgentRuntime,
	CacheManager,
	CacheStore,
	type Character,
	type Client,
	type ClientInstance,
	DbCacheAdapter,
	FsCacheAdapter,
	type ICacheManager,
	type IDatabaseAdapter,
	type IDatabaseCacheAdapter,
	ModelProviderName,
	type Plugin,
	elizaLogger,
	stringToUuid,
} from "@elizaos/core";
import type { NodeSDK } from "@opentelemetry/sdk-node";
import dedent from "dedent";
import { defaultCharacter } from "./default-charecter";

export interface TelemetryOptions {
	sdk: NodeSDK;
	flushIntervalMs: number;
}

export interface AgentOptions {
	adapter?: Adapter;
	clients?: Client[];
	plugins?: Plugin[];
	modelProvider?: ModelProviderName;
	modelKey?: string;
	character?: Partial<Character>;
	cacheStore?: CacheStore;
	telemetry?: TelemetryOptions;
}

export class Agent {
	private cacheManager: ICacheManager;
	private runtime: AgentRuntime;
	private clients: ClientInstance[] = [];
	private readonly options: AgentOptions;
	private db: IDatabaseAdapter & IDatabaseCacheAdapter;
	private telemetryFlushInterval: NodeJS.Timeout | null = null;

	constructor(options: AgentOptions) {
		this.options = {
			clients: [],
			...options,
		};
	}

	public async start() {
		elizaLogger.info("🚀 Starting Agent initialization...");
		try {
			// Initialize telemetry if configured
			if (this.options.telemetry) {
				this.initializeTelemetry();
			}

			const runtime = await this.createRuntime();

			if (this.options.adapter) {
				this.db = this.options.adapter.init(runtime);
				runtime.databaseAdapter = this.db;
			}

			this.cacheManager = this.initializeCache();
			runtime.cacheManager = this.cacheManager;

			await runtime.initialize();

			elizaLogger.info("🔌 Starting client initialization...");
			for (const client of this.options.clients || []) {
				const clientInstance = await client.start(runtime);
				if (clientInstance) {
					this.clients[client.name] = clientInstance;
				}
				if (client.name === "direct") {
					const instance = clientInstance as unknown as {
						registerAgent: (runtime: AgentRuntime) => void;
					};
					instance.registerAgent(runtime);
					elizaLogger.info(dedent`\n
						╔════════════════════════════════════════════╗
						║       *~* Direct client initialized *~*    ║
						║       you can test out your agents in:     ║
						║           https://console.iqai.com         ║
						╚════════════════════════════════════════════╝
						\n
				 `);
				}
			}

			runtime.clients = this.clients;

			elizaLogger.info("✨ Agent initialization completed successfully");
		} catch (error) {
			elizaLogger.info("❌ Error during agent initialization:", error);
			await this.stop();
			throw error;
		}
	}

	private initializeTelemetry() {
		const { sdk, flushIntervalMs } = this.options.telemetry;

		// Start the SDK
		sdk.start();
		elizaLogger.info("📊 Telemetry initialized");

		// Set up periodic flushing by restarting the SDK
		this.telemetryFlushInterval = setInterval(async () => {
			try {
				elizaLogger.info("🗑️ Flushing telemetry data...");
				await sdk.shutdown();
				sdk.start();
			} catch (error) {
				elizaLogger.warn("🚧 Error flushing telemetry:", error);
			}
		}, flushIntervalMs);
	}

	private initializeCache() {
		const cacheId = stringToUuid("default");

		switch (this.options.cacheStore) {
			case CacheStore.DATABASE:
				return new CacheManager(new DbCacheAdapter(this.db, cacheId));
			case CacheStore.FILESYSTEM: {
				const cacheDir = path.resolve(process.cwd(), "cache");
				return new CacheManager(new FsCacheAdapter(cacheDir));
			}
			default:
				return new CacheManager(new DbCacheAdapter(this.db, cacheId));
		}
	}

	private async createRuntime() {
		const plugins = [...(this.options.plugins || [])];
		const modelProvider =
			this.options.modelProvider ||
			this.options.character?.modelProvider ||
			ModelProviderName.OPENAI;

		this.runtime = new AgentRuntime({
			token: this.options.modelKey,
			modelProvider,
			plugins,
			character: {
				...defaultCharacter,
				...this.options.character,
				modelProvider,
				settings: {
					...(defaultCharacter.settings || {}),
					...(this.options.character?.settings || {}),
					secrets: {
						...(defaultCharacter.settings?.secrets || {}),
						...(this.options.character?.settings?.secrets || {}),
						...process.env,
					},
					modelConfig: {
						experimental_telemetry: {
							isEnabled: true,
						},
					},
				},
			},
			fetch: async (url: string, options: RequestInit) => {
				return fetch(url, options);
			},
			evaluators: [],
			providers: [],
			actions: [],
			services: [],
			managers: [],
		});

		return this.runtime;
	}

	public async stop() {
		elizaLogger.info("🛑 Stopping agent...");

		// Clean up telemetry
		if (this.options.telemetry) {
			if (this.telemetryFlushInterval) {
				clearInterval(this.telemetryFlushInterval);
				this.telemetryFlushInterval = null;
			}

			try {
				elizaLogger.info("📊 Shutting down telemetry...");
				await this.options.telemetry.sdk.shutdown();
				elizaLogger.info("📊 Telemetry shutdown complete");
			} catch (error) {
				elizaLogger.error("Error shutting down telemetry:", error);
			}
		}

		await this.runtime?.stop();
		await this.db?.close();
	}

	public getClients() {
		return this.clients;
	}
}
