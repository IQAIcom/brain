import type {
	Adapter,
	CacheStore,
	Character,
	Client,
	ModelProviderName,
	Plugin,
} from "@elizaos/core";
import { Agent, type AgentOptions } from "./agent";

export class AgentBuilder {
	private options: Partial<AgentOptions> = {};

	public withDatabase(adapter: Adapter | Plugin) {
		if (this.isAdapterPlugin(adapter)) {
			this.options.adapter = adapter.adapters[0];
		} else {
			this.options.adapter = adapter as Adapter;
		}
		return this;
	}

	public withClient(client: Client | Plugin) {
		if (this.isClientPlugin(client)) {
			this.options.clients = [
				...(this.options.clients || []),
				...client.clients,
			];
		} else {
			this.options.clients = [
				...(this.options.clients || []),
				client as Client,
			];
		}
		return this;
	}

	public withClients(clients: (Client | Plugin)[]) {
		const passedClients = clients?.flatMap((client) => {
			if (this.isClientPlugin(client)) {
				return client.clients as Client[];
			}
			return client as Client;
		});

		this.options.clients = [...(this.options.clients || []), ...passedClients];
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
		if (!this.options.adapter) {
			throw new Error("Database adapter is required");
		}
		return new Agent(this.options as AgentOptions);
	}

	private isClientPlugin(obj: Client | Plugin): obj is Plugin {
		return "clients" in obj;
	}

	private isAdapterPlugin(obj: Adapter | Plugin): obj is Plugin {
		return "adapters" in obj;
	}
}
