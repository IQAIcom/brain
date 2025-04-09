import {
	AgentRuntime,
	type Character,
	type Plugin,
	logger,
} from "@elizaos/core";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { NodeSDK } from "@opentelemetry/sdk-node";
import type { SpanExporter } from "@opentelemetry/sdk-trace-base";
import dedent from "dedent";
import { defaultCharacter } from "./default-charecter";

export interface AgentOptions {
	modelProvider?: Plugin;
	plugins?: Plugin[];
	character?: Partial<Character>;
	telemetryExporter?: SpanExporter;
}

export class Agent {
	private readonly options: AgentOptions;
	private runtime: AgentRuntime;
	private telemetrySdk: NodeSDK;

	constructor(options: AgentOptions) {
		this.options = options;
	}

	/**
	 * Initializes and starts the Agent, setting up telemetry, runtime, database, cache, and clients.
	 *
	 * @throws {Error} If any initialization step fails, the method will stop the agent and rethrow the error.
	 */
	public async start() {
		logger.info("🚀 Starting Agent initialization...");
		this.initializeTelemetry();
		try {
			const runtime = await this.createRuntime();
			await runtime.initialize();
			logger.info("✨ Agent initialization completed successfully");
			logger.info(dedent`\n
				╔════════════════════════════════════════════╗
				║       you can test out your agents in:     ║
				║           https://console.iqai.com         ║
				╚════════════════════════════════════════════╝
				\n
		 `);
		} catch (error) {
			logger.info("❌ Error during agent initialization:", error);
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
			logger.info("📊 Telemetry initialized");
		} catch (error) {
			logger.error("🚨 Error initializing telemetry:", error);
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
		const character: Character = {
			...defaultCharacter,
			...this.options.character,
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
		};
		this.runtime = new AgentRuntime({
			plugins,
			character: character,
			fetch: async (url: string, options: RequestInit) => {
				return fetch(url, options);
			},
		});
		return this.runtime;
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
		logger.info("🛑 Stopping agent...");
		if (this.telemetrySdk) {
			try {
				await this.telemetrySdk.shutdown();
				logger.info("📊 Telemetry shutdown complete");
			} catch (error) {
				logger.error("🚨 Error shutting down telemetry:", error);
			}
		}
		await this.runtime?.stop();
	}
}
