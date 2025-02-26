// src/createMcpPlugin.ts

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { McpPluginConfig } from "./types";
import { elizaLogger, type Plugin } from "@elizaos/core";
import type { Action } from "@elizaos/core";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { createAction } from "./lib/create-action";
import type { ListToolsResult } from "@modelcontextprotocol/sdk/types.js";
/**
 * Initializes an MCP client based on configuration.
 */
async function initializeMcpClient(config: McpPluginConfig): Promise<Client> {
	try {
		let transport: Transport;

		if (config.mode === "sse") {
			transport = new SSEClientTransport(new URL(config.serverUrl));
		} else {
			transport = new StdioClientTransport({
				command: config.command,
				args: config.args,
			});
		}

		const client = new Client(
			{
				name: "McpPluginClient",
				//TODO: sync with package version
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

/**
 * Creates an MCP plugin by:
 * 1. Connecting to the MCP server (local or remote).
 * 2. Retrieving available all tools.
 * 3. Converting them into Actions.
 * 4. Packaging them into a Plugin object.
 */
export async function createMcpPlugin(
	config: McpPluginConfig,
): Promise<Plugin> {
	try {
		// Step 1: Connect to the MCP server.
		const client = await initializeMcpClient(config);

		// Step 2: Retrieve all tools
		const toolsResponse = (await client.listTools()) as ListToolsResult;

		// Step 3: Convert capabilities into Actions.
		const actions: Action[] = [];

		for (const tool of toolsResponse.tools) {
			const action: Action = await createAction(tool, client);
			actions.push(action);
		}

		// Step 4: Package actions into a Plugin object.
		const plugin: Plugin = {
			name: "mcp",
			description: "MCP Plugin",
			actions,
		};

		return plugin;
	} catch (error) {
		console.error("Error creating MCP plugin:", error);
		throw error;
	}
}
