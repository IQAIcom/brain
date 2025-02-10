import {
	AgentRuntime,
	CacheManager,
	CacheStore,
	DbCacheAdapter,
	FsCacheAdapter,
	type ICacheManager,
	type IDatabaseAdapter,
	type IDatabaseCacheAdapter,
	ModelProviderName,
	stringToUuid,
	type Client,
	type Plugin,
	type Character,
	elizaLogger,
} from "@elizaos/core";
import path from "node:path";
import { defaultCharacter } from "./default-charecter";

export interface AgentOptions {
	databaseAdapter?: IDatabaseAdapter & IDatabaseCacheAdapter;
	clients?: { name: string; client: Client }[];
	plugins?: Plugin[];
	modelProvider?: ModelProviderName;
	modelKey?: string;
	character?: Partial<Character>;
	cacheStore?: CacheStore;
}

export class Agent {
	private cacheManager: ICacheManager;
	private runtime: AgentRuntime;
	private clients: Record<string, Client> = {};
	private readonly options: AgentOptions;

	constructor(options: AgentOptions) {
		this.options = {
			clients: [],
			...options,
		};
	}

	public async start() {
		elizaLogger.info("🚀 Starting Agent initialization...");
		try {
			if (this.options.databaseAdapter) {
				elizaLogger.info("📦 Initializing database adapter...");
				await this.options.databaseAdapter.init();
			}

			elizaLogger.info("💾 Setting up cache manager...");
			this.cacheManager = this.initializeCache();

			elizaLogger.info("⚙️ Initializing runtime...");
			const runtime = await this.initializeRuntime();

			elizaLogger.info("🔌 Starting client initialization...");
			for (const { name, client } of this.options.clients || []) {
				elizaLogger.info(`📱 Initializing client: ${name}`);
				const clientInstance = await client.start(runtime);
				if (clientInstance) {
					this.clients[name] = clientInstance as Client;
					elizaLogger.info(`✅ Client ${name} initialized successfully`);
				}
				if (name === "direct") {
					elizaLogger.info("🎯 Registering direct agent...");
					const instance = clientInstance as {
						registerAgent: (runtime: AgentRuntime) => void;
					};
					instance.registerAgent(this.runtime as AgentRuntime);
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

	private initializeCache() {
		elizaLogger.info("🔧 Initializing cache system...");
		const cacheId = stringToUuid("default");

		switch (this.options.cacheStore) {
			case CacheStore.DATABASE:
				elizaLogger.info("💽 Using database cache store");
				return new CacheManager(
					new DbCacheAdapter(this.options.databaseAdapter, cacheId),
				);
			case CacheStore.FILESYSTEM: {
				elizaLogger.info("📂 Using filesystem cache store");
				const cacheDir = path.resolve(process.cwd(), "cache");
				return new CacheManager(new FsCacheAdapter(cacheDir));
			}
			default:
				elizaLogger.info("💽 Using default database cache store");
				return new CacheManager(
					new DbCacheAdapter(this.options.databaseAdapter, cacheId),
				);
		}
	}

	private async initializeRuntime() {
		elizaLogger.info("🔄 Setting up runtime configuration...");
		const plugins = [...(this.options.plugins || [])];
		const modelProvider =
			this.options.modelProvider ||
			this.options.character?.modelProvider ||
			ModelProviderName.OPENAI;

		elizaLogger.info(`🤖 Using model provider: ${modelProvider}`);

		this.runtime = new AgentRuntime({
			databaseAdapter: this.options.databaseAdapter,
			token: this.options.modelKey,
			modelProvider,
			plugins,
			character: {
				...defaultCharacter,
				...this.options.character,
				modelProvider,
			},
			cacheManager: this.cacheManager,
			fetch: async (url: string, options: RequestInit) => {
				return fetch(url, options);
			},
			evaluators: [],
			providers: [],
			actions: [],
			services: [],
			managers: [],
		});

		elizaLogger.info("🌟 Initializing runtime...");
		await this.runtime.initialize();
		elizaLogger.info("✅ Runtime initialization completed");
		return this.runtime;
	}

	public async stop() {
		elizaLogger.info("🛑 Stopping agent...");
		await this.runtime?.stop();
		await this.options.databaseAdapter?.close();
		elizaLogger.info("👋 Agent stopped successfully");
	}

	public getClients() {
		return this.clients;
	}
}
