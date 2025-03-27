import type { Action, Plugin } from "@elizaos/core";
import type { ListToolsResult } from "@modelcontextprotocol/sdk/types.js";
import type { McpPluginConfig } from "./types";
import { createAction } from "./lib/create-action";
import { McpClientService } from "./services/mcp-client";

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
		// Step 1: Connect to the MCP server using the service.
		const mcpClientService = new McpClientService(config);
		const client = await mcpClientService.initialize();

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
			name: config.name,
			description: config.description,
			actions,
		};

		return plugin;
	} catch (error) {
		console.error("Error creating MCP plugin:", error);
		throw error;
	}
}
