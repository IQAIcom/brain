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
		try {
			await this.options.databaseAdapter?.init();
			this.cacheManager = this.initializeCache();
			const runtime = await this.initializeRuntime();
			for (const { name, client } of this.options.clients || []) {
				const clientInstance = await client.start(runtime);
				if (clientInstance) {
					this.clients[name] = clientInstance as Client;
				}
				if (name === "direct") {
					const instance = clientInstance as {
						registerAgent: (runtime: AgentRuntime) => void;
					};
					instance.registerAgent(this.runtime as AgentRuntime);
				}
			}

			runtime.clients = this.clients;
		} catch (error) {
			await this.stop();
			throw error;
		}
	}

	private initializeCache() {
		const cacheId = stringToUuid("default");

		switch (this.options.cacheStore) {
			case CacheStore.DATABASE:
				return new CacheManager(
					new DbCacheAdapter(this.options.databaseAdapter, cacheId),
				);
			case CacheStore.FILESYSTEM: {
				const cacheDir = path.resolve(process.cwd(), "cache");
				return new CacheManager(new FsCacheAdapter(cacheDir));
			}
			default:
				return new CacheManager(
					new DbCacheAdapter(this.options.databaseAdapter, cacheId),
				);
		}
	}

	private async initializeRuntime() {
		const plugins = [...(this.options.plugins || [])];
		const modelProvider =
			this.options.modelProvider ||
			this.options.character?.modelProvider ||
			ModelProviderName.OPENAI;

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

		await this.runtime.initialize();
		return this.runtime;
	}

	public async stop() {
		await this.runtime?.stop();
		await this.options.databaseAdapter?.close();
	}

	public getClients() {
		return this.clients;
	}
}
