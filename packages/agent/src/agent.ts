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
import dedent from "dedent";
import { defaultCharacter } from "./default-charecter";

export interface AgentOptions {
	adapter?: Adapter;
	clients?: Client[];
	plugins?: Plugin[];
	modelProvider?: ModelProviderName;
	modelKey?: string;
	character?: Partial<Character>;
	cacheStore?: CacheStore;
}

export class Agent {
	private cacheManager: ICacheManager;
	private runtime: AgentRuntime;
	private clients: ClientInstance[] = [];
	private readonly options: AgentOptions;
	private db: IDatabaseAdapter & IDatabaseCacheAdapter;

	constructor(options: AgentOptions) {
		this.options = {
			clients: [],
			...options,
		};
	}

	public async start() {
		elizaLogger.info("🚀 Starting Agent initialization...");
		try {
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
		await this.runtime?.stop();
		await this.db?.close();
	}

	public getClients() {
		return this.clients;
	}
}
