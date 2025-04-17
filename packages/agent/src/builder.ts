import type { Character, IDatabaseAdapter, Plugin } from "@elizaos/core";
import type { SpanExporter } from "@opentelemetry/sdk-trace-base";
import { Agent, type AgentOptions } from "./agent";

export class AgentBuilder {
	private options: Partial<AgentOptions> = {};

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
	public withModelProvider(provider: Plugin) {
		this.options.modelProvider = provider;
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
	 * Configure telemetry with a custom exporter
	 * @param exporter The OpenTelemetry exporter to use
	 * @returns The builder instance for chaining
	 */
	public withTelemetry(exporter: SpanExporter) {
		this.options.telemetryExporter = exporter;
		return this;
	}

	/**
	 * Build and return the configured Agent instance
	 * @throws Error if no database adapter is configured
	 * @returns A fully configured Agent instance
	 */
	public build(): Agent {
		return new Agent(this.options as AgentOptions);
	}
}
