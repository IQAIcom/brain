import { elizaLogger, type Action, type Handler } from "@elizaos/core";
import { InputParserService } from "../services/input-parser";
import dedent from "dedent";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { generateToolTemplate } from "../services/generate-tool-template";

export async function createAction(
	tool: Tool,
	client: Client,
): Promise<Action> {
	// Create handler function for the action
	const handler: Handler = async (
		runtime,
		message,
		state,
		_options,
		callback,
	) => {
		try {
			// 1. Parse inputs using InputParserService
			const inputParser = new InputParserService();
			const parsedInputs = await inputParser.parseInputs({
				runtime,
				message,
				state,
				template: generateToolTemplate(tool),
			});

			// 2. Check for parsing errors
			if (parsedInputs.error) {
				callback?.({
					text: `❌ ${parsedInputs.error}`,
				});
				return false;
			}

			// 3. Call the MCP tool
			const result: CallToolResult = await client.callTool({
				name: tool.name,
				arguments: parsedInputs,
			});

			// 4. Format and return response
			callback?.({
				text: dedent`
          ✅ Tool Execution Successful

          ${result.content.map((c) => c.text).join("\n")}
        `,
			});
			return true;
		} catch (error) {
			callback?.({
				text: dedent`
          ❌ Tool Execution Failed

          Error: ${error.message}

          Please verify your inputs and try again.
        `,
			});
			return false;
		}
	};

	// Create and return the Action
	elizaLogger.info("🚀 Creating action for tool:", tool.name);
	return {
		name: tool.name.toUpperCase(),
		description: tool.description || `Execute ${tool.name} tool`,
		similes: [],
		handler,
		validate: async () => true,
		examples: [],
	};
}
