import type {
	Character,
	Client,
	IDatabaseAdapter,
	IDatabaseCacheAdapter,
	Plugin,
	CacheStore,
} from "@elizaos/core";
import { Agent, type AgentOptions } from "./agent";
import { type ModelProviderName } from "./types";
export class AgentBuilder {
	private options: Partial<AgentOptions> = {};

	public withDatabase(adapter: IDatabaseAdapter & IDatabaseCacheAdapter) {
		this.options.databaseAdapter = adapter;
		return this;
	}

	public withClient(name: string, client: Client) {
		this.options.clients = [...(this.options.clients || []), { name, client }];
		return this;
	}

	public withClients(clients: { name: string; client: Client }[]) {
		this.options.clients = [...(this.options.clients || []), ...clients];
		return this;
	}

	public withPlugin(plugin: Plugin) {
		this.options.plugins = [...(this.options.plugins || []), plugin];
		return this;
	}

	public withPlugins(plugins: Plugin[]) {
		this.options.plugins = [...(this.options.plugins || []), ...plugins];
		return this;
	}

	public withModelProvider(provider: ModelProviderName, key: string) {
		this.options.modelProvider = provider;
		this.options.modelKey = key;
		return this;
	}

	public withCharacter(character: Partial<Character>) {
		this.options.character = character;
		return this;
	}

	public withCacheStore(cacheStore: CacheStore) {
		this.options.cacheStore = cacheStore;
		return this;
	}

	public build(): Agent {
		if (!this.options.databaseAdapter) {
			throw new Error("Database adapter is required");
		}
		return new Agent(this.options as AgentOptions);
	}
}
