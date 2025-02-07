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
	defaultCharacter,
	stringToUuid,
	type Client,
} from "@elizaos/core";
import path from "node:path";
import type { AgentConfig } from "./index";

export class Agent {
	private cacheManager: ICacheManager;
	private runtime: AgentRuntime;
	private clients: Record<string, Client> = {};

	constructor(
		private databaseAdapter: IDatabaseAdapter & IDatabaseCacheAdapter,
		private clientInterfaces: { name: string; client: Client }[] = [],
		private config: AgentConfig = {},
	) {}

	private initializeCache() {
		const cacheId = stringToUuid("default");

		switch (this.config.cacheStore) {
			case CacheStore.DATABASE:
				return new CacheManager(
					new DbCacheAdapter(this.databaseAdapter, cacheId),
				);
			case CacheStore.FILESYSTEM: {
				const cacheDir = path.resolve(process.cwd(), "cache");
				return new CacheManager(new FsCacheAdapter(cacheDir));
			}
			default:
				return new CacheManager(
					new DbCacheAdapter(this.databaseAdapter, cacheId),
				);
		}
	}

	private async initializeRuntime() {
		const plugins = [...(this.config.plugins || [])];
		const modelProvider =
			this.config.modelProvider ||
			this.config.character?.modelProvider ||
			ModelProviderName.OPENAI;

		this.runtime = new AgentRuntime({
			databaseAdapter: this.databaseAdapter,
			token: this.config.modelKey,
			modelProvider,
			plugins,
			character: {
				...defaultCharacter,
				...this.config.character,
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

	public async start() {
		try {
			await this.databaseAdapter.init();
			this.cacheManager = this.initializeCache();
			const runtime = await this.initializeRuntime();

			for (const { name, client } of this.clientInterfaces) {
				const clientInstance = await client.start(runtime);
				if (clientInstance) {
					this.clients[name] = clientInstance as Client;
				}
			}

			runtime.clients = this.clients;
		} catch (error) {
			await this.stop();
			throw error;
		}
	}

	public async stop() {
		await this.runtime?.stop();
		await this.databaseAdapter?.close();
	}

	public getClients() {
		return this.clients;
	}
}
