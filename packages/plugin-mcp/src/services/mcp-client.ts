import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { elizaLogger } from "@elizaos/core";
import type { McpPluginConfig } from "../types";

export class McpClientService {
	private config: McpPluginConfig;

	constructor(config: McpPluginConfig) {
		this.config = config;
	}

	/**
	 * Initializes and returns an MCP client based on configuration.
	 */
	async initialize(): Promise<Client> {
		try {
			let transport: Transport;

			if (this.config.transport.mode === "sse") {
				elizaLogger.log(
					"🚀 Initializing MCP client in SSE mode",
					this.config.transport.serverUrl,
				);
				transport = new SSEClientTransport(
					new URL(this.config.transport.serverUrl),
					{
						requestInit: {
							headers: this.config.transport.headers,
						},
					},
				);
			} else {
				transport = new StdioClientTransport({
					command: this.config.transport.command,
					args: this.config.transport.args,
				});
			}

			const client = new Client(
				{
					name: this.config.name,
					version: "0.0.1",
				},
				{
					capabilities: {
						prompts: {},
						resources: {},
						tools: {},
					},
				},
			);

			await client.connect(transport);
			return client;
		} catch (error) {
			elizaLogger.error("Failed to initialize MCP client");
			throw error;
		}
	}
}
