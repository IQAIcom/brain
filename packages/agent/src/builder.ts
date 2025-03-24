import type {
	Adapter,
	CacheStore,
	Character,
	Client,
	ModelProviderName,
	Plugin,
} from "@elizaos/core";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { Agent, type AgentOptions } from "./agent";

export class AgentBuilder {
	private options: Partial<AgentOptions> = {};
	private telemetryExporter: any = null;
	private telemetryFlushInterval: number = 1 * 60 * 1000; // 1 minute default

	/**
	 * Configure the database adapter for the agent
	 * @param adapter The database adapter or plugin to use
	 * @returns The builder instance for chaining
	 */
	public withDatabase(adapter: Adapter | Plugin) {
		if (this.isAdapterPlugin(adapter)) {
			this.options.adapter = adapter.adapters[0];
		} else {
			this.options.adapter = adapter as Adapter;
		}
		return this;
	}

	/**
	 * Add a client to the agent
	 * @param client The client or client plugin to add
	 * @returns The builder instance for chaining
	 */
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

	/**
	 * Add multiple clients to the agent
	 * @param clients An array of clients or client plugins to add
	 * @returns The builder instance for chaining
	 */
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

	/**
	 * Add a plugin to the agent
	 * @param plugin The plugin to add
	 * @returns The builder instance for chaining
	 */
	public withPlugin(plugin: Plugin) {
		this.options.plugins = [...(this.options.plugins || []), plugin];
		return this;
	}

	/**
	 * Add multiple plugins to the agent
	 * @param plugins An array of plugins to add
	 * @returns The builder instance for chaining
	 */
	public withPlugins(plugins: Plugin[]) {
		this.options.plugins = [...(this.options.plugins || []), ...plugins];
		return this;
	}

	/**
	 * Configure the model provider for the agent
	 * @param provider The name of the model provider to use
	 * @param key The API key for the model provider
	 * @returns The builder instance for chaining
	 */
	public withModelProvider(provider: ModelProviderName, key: string) {
		this.options.modelProvider = provider;
		this.options.modelKey = key;
		return this;
	}

	/**
	 * Configure the character for the agent.
	 * @param character The character configuration
	 * @returns The builder instance for chaining
	 */
	public withCharacter(character: Partial<Character>) {
		this.options.character = character;
		return this;
	}

	/**
	 * Configure the cache store for the agent
	 * @param cacheStore The cache store implementation to use
	 * @returns The builder instance for chaining
	 */
	public withCacheStore(cacheStore: CacheStore) {
		this.options.cacheStore = cacheStore;
		return this;
	}

	/**
	 * Configure telemetry with a custom exporter
	 * @param exporter The OpenTelemetry exporter to use
	 * @param flushIntervalMs How often to flush telemetry data (default: 5 minutes)
	 * @returns The builder instance for chaining
	 */
	public withTelemetry(exporter: any, flushIntervalMs: number = 5 * 60 * 1000) {
		this.telemetryExporter = exporter;
		this.telemetryFlushInterval = flushIntervalMs;
		return this;
	}

	/**
	 * Build and return the configured Agent instance
	 * @throws Error if no database adapter is configured
	 * @returns A fully configured Agent instance
	 */
	public build(): Agent {
		if (!this.options.adapter) {
			throw new Error("Database adapter is required");
		}

		// Set up telemetry if configured
		if (this.telemetryExporter) {
			const sdk = new NodeSDK({
				traceExporter: this.telemetryExporter,
				instrumentations: [getNodeAutoInstrumentations()],
			});

			this.options.telemetry = {
				sdk,
				flushIntervalMs: this.telemetryFlushInterval,
			};
		}

		return new Agent(this.options as AgentOptions);
	}

	/**
	 * Type guard to check if an object is a Client plugin
	 * @param obj The object to check
	 * @returns True if the object is a Client plugin
	 */
	private isClientPlugin(obj: Client | Plugin): obj is Plugin {
		return "clients" in obj;
	}

	/**
	 * Type guard to check if an object is an Adapter plugin
	 * @param obj The object to check
	 * @returns True if the object is an Adapter plugin
	 */
	private isAdapterPlugin(obj: Adapter | Plugin): obj is Plugin {
		return "adapters" in obj;
	}
}
