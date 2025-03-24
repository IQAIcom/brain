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
	type IDatabaseAdapter,
	type IDatabaseCacheAdapter,
	ModelProviderName,
	type Plugin,
	elizaLogger,
	stringToUuid,
} from "@elizaos/core";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { NodeSDK } from "@opentelemetry/sdk-node";
import type { SpanExporter } from "@opentelemetry/sdk-trace-base";
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
	telemetryExporter?: SpanExporter;
}

export class Agent {
	private readonly options: AgentOptions;
	private runtime: AgentRuntime;
	private db: IDatabaseAdapter & IDatabaseCacheAdapter;
	private telemetrySdk: NodeSDK;

	constructor(options: AgentOptions) {
		this.options = {
			clients: [],
			...options,
		};
	}

	/**
	 * Initializes and starts the Agent, setting up telemetry, runtime, database, cache, and clients.
	 *
	 * @throws {Error} If any initialization step fails, the method will stop the agent and rethrow the error.
	 */
	public async start() {
		elizaLogger.info("🚀 Starting Agent initialization...");
		this.initializeTelemetry();
		try {
			const runtime = await this.createRuntime();

			if (this.options.adapter) {
				this.db = this.options.adapter.init(runtime);
				runtime.databaseAdapter = this.db;
			}

			this.initializeCache(runtime);
			await runtime.initialize();
			await this.initializeClients(runtime);

			elizaLogger.info("✨ Agent initialization completed successfully");
		} catch (error) {
			elizaLogger.info("❌ Error during agent initialization:", error);
			await this.stop();
			throw error;
		}
	}

	/**
	 * Initializes telemetry for the agent using the provided telemetry exporter.
	 *
	 * If no telemetry exporter is configured, the method will silently return.
	 * Starts the NodeSDK with auto-instrumentations and logs the initialization status.
	 *
	 * @private
	 * @throws {Error} If telemetry initialization fails, logs the error.
	 */
	private initializeTelemetry() {
		if (!this.options.telemetryExporter) {
			return;
		}
		try {
			this.telemetrySdk = new NodeSDK({
				traceExporter: this.options.telemetryExporter,
				instrumentations: [getNodeAutoInstrumentations()],
			});
			this.telemetrySdk.start();
			elizaLogger.info("📊 Telemetry initialized");
		} catch (error) {
			elizaLogger.error("🚨 Error initializing telemetry:", error);
		}
	}

	/**
	 * Creates and configures an AgentRuntime instance with default and custom settings.
	 *
	 * Initializes the runtime with model provider, plugins, character configuration,
	 * and default empty collections for evaluators, providers, actions, services, and managers.
	 *
	 * @returns The configured AgentRuntime instance
	 */
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

	/**
	 * Initializes the cache manager for the agent runtime based on the specified cache store type.
	 *
	 * Supports database and filesystem cache storage, with database as the default fallback.
	 * Sets the initialized cache manager on the provided runtime instance.
	 *
	 * @param runtime The AgentRuntime instance to attach the cache manager to
	 */
	private initializeCache(runtime: AgentRuntime) {
		const cacheId = stringToUuid("default");
		let cacheManager: CacheManager;
		switch (this.options.cacheStore) {
			case CacheStore.DATABASE:
				cacheManager = new CacheManager(new DbCacheAdapter(this.db, cacheId));
				break;
			case CacheStore.FILESYSTEM: {
				const cacheDir = path.resolve(process.cwd(), "cache");
				cacheManager = new CacheManager(new FsCacheAdapter(cacheDir));
				break;
			}
			default:
				cacheManager = new CacheManager(new DbCacheAdapter(this.db, cacheId));
				break;
		}
		runtime.cacheManager = cacheManager;
	}

	/**
	 * Initializes and starts client instances for the agent runtime.
	 *
	 * Iterates through configured clients, starts each client, and registers them
	 * with the runtime. Provides special handling for the "direct" client, which
	 * includes a console log with connection information.
	 *
	 * @param runtime The AgentRuntime instance to initialize clients for
	 * @private
	 */
	private async initializeClients(runtime: AgentRuntime) {
		elizaLogger.info("🔌 Starting client initialization...");
		const clients: ClientInstance[] = [];

		for (const client of this.options.clients || []) {
			const clientInstance = await client.start(runtime);
			if (clientInstance) {
				clients[client.name] = clientInstance;
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
		runtime.clients = clients;
	}

	/**
	 * Gracefully stops the agent by shutting down telemetry, runtime, and database connections.
	 *
	 * This method performs cleanup operations including:
	 * - Logging the agent stop process
	 * - Shutting down telemetry SDK if available
	 * - Stopping the agent runtime
	 * - Closing the database connection
	 *
	 * @async
	 */
	public async stop() {
		elizaLogger.info("🛑 Stopping agent...");
		if (this.telemetrySdk) {
			try {
				await this.telemetrySdk.shutdown();
				elizaLogger.info("📊 Telemetry shutdown complete");
			} catch (error) {
				elizaLogger.error("🚨 Error shutting down telemetry:", error);
			}
		}
		await this.runtime?.stop();
		await this.db?.close();
	}
}
