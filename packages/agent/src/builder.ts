import type {
	Character,
	Client,
	IDatabaseAdapter,
	IDatabaseCacheAdapter,
	ModelProviderName,
	Plugin,
} from "@elizaos/core";
import { Agent } from "./agent";
import type { AgentConfig } from "./index";

export class AgentBuilder {
	private config: AgentConfig = {};
	private clientInterfaces: { name: string; client: Client }[] = [];
	private databaseAdapter: IDatabaseAdapter & IDatabaseCacheAdapter;

	public withDatabase(adapter: IDatabaseAdapter & IDatabaseCacheAdapter) {
		this.databaseAdapter = adapter;
		return this;
	}

	public withClient(name: string, client: Client) {
		this.clientInterfaces.push({ name, client });
		return this;
	}

	public withPlugin(plugin: Plugin) {
		this.config.plugins = [...(this.config.plugins || []), plugin];
		return this;
	}

	public withModelProvider(provider: ModelProviderName, key: string) {
		this.config.modelProvider = provider;
		this.config.modelKey = key;
		return this;
	}

	public withCharacter(character: Partial<Character>) {
		this.config.character = character;
		return this;
	}

	public build(): Agent {
		return new Agent(this.databaseAdapter, this.clientInterfaces, this.config);
	}
}
