import {
	type Content,
	elizaLogger,
	generateText,
	getEmbeddingZeroVector,
	type HandlerCallback,
	type IAgentRuntime,
	type Memory,
	ModelClass,
	type State,
	stringToUuid,
	type Action,
	type Handler,
} from "@elizaos/core";
import { InputParserService } from "../services/input-parser";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { generateToolTemplate, PROCESS_TEMPLATE } from "./templates";

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

			// 4. Check for tool execution errors
			if (result.isError) {
				callback?.({
					text: `
					❌ Tool Execution Failed
					Error: ${result.error}
					`,
				});
				return false;
			}
			// 5. Check result content, if any file paths or other data apart from plain text is present
			// call the runtime to handle it if it can with available actions (eg. fs), else make the content readable/pretty
			return await postProcessResponse(
				runtime,
				result,
				state,
				message,
				callback,
			);
		} catch (error) {
			callback?.({
				text: `
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

async function postProcessResponse(
	runtime: IAgentRuntime,
	response: CallToolResult,
	state: State,
	memory: Memory,
	callback: HandlerCallback,
) {
	const actions = runtime.actions.filter((a) => a.name !== "SEQUENCER");
	elizaLogger.info(
		`ℹ️ Available actions for post-processing: ${actions.map((a) => a?.name)}`,
	);

	// Save initial tool result to memory
	await saveToMemory(
		runtime,
		memory,
		state,
		`Processing tool result: ${JSON.stringify(response, null, 2)}`,
		"post-process-start",
	);
	elizaLogger.info("memory content", memory.content.text);

	const output = await generateText({
		runtime: runtime,
		modelClass: ModelClass.LARGE,
		context: `Tool output to process: ${JSON.stringify(response, null, 2)}`,
		customSystemPrompt: PROCESS_TEMPLATE,
		maxSteps: 10,
		tools: Object.fromEntries(
			actions.map((a) => [
				a.name,
				{
					parameters: z.object({
						reason: z
							.string()
							.describe(
								"Reason for using this tool. Explain why this tool is needed to process the current output.",
							),
					}),
					description: a.description,
					execute: async ({ reason }) =>
						await handlerWrapper(
							a.name,
							a.handler,
							reason,
							runtime,
							state,
							memory,
						),
				},
			]),
		),
	});

	return callback?.({
		text: output,
	});
}
async function handlerWrapper(
	name: string,
	handler: Handler,
	reason: string,
	runtime: IAgentRuntime,
	state: State,
	memory: Memory,
) {
	elizaLogger.info(`\n🔄 Executing handler: ${name}...`);

	// Save action execution to memory
	await saveToMemory(
		runtime,
		memory,
		state,
		`## Action Execution
**Action:** ${name}
**Reason:** ${reason}`,
		`action-${name}-start`,
	);

	try {
		const { text } = await new Promise<Content>((resolve) =>
			handler(runtime, memory, state, null, resolve as HandlerCallback),
		);
		elizaLogger.info(`✅ Handler executed: ${name}`, { text });

		// Save action result to memory
		await saveToMemory(
			runtime,
			memory,
			state,
			`## Action Result
**Action:** ${name}
**Status:** Completed
**Result:**
\`\`\`
${text}
\`\`\``,
			`action-${name}-result`,
		);

		return text;
	} catch (error) {
		elizaLogger.error(`❌ Error executing handler ${name}:`, error);

		// Save error to memory
		await saveToMemory(
			runtime,
			memory,
			state,
			`## Action Error
**Action:** ${name}
**Status:** Failed
**Error:**
\`\`\`
${error.message}
\`\`\``,
			`action-${name}-error`,
		);

		return `Error executing ${name}: ${error.message}`;
	}
}

async function saveToMemory(
	runtime: IAgentRuntime,
	memory: Memory,
	state: State,
	text: string,
	suffix = "memory",
) {
	3;
	const memoryId = stringToUuid(`${memory.id}-${suffix}`);
	await runtime.messageManager.createMemory({
		id: memoryId,
		content: { text },
		userId: memory.userId,
		roomId: state.roomId,
		agentId: runtime.agentId,
		createdAt: Date.now(),
		embedding: getEmbeddingZeroVector(),
	});
	return memoryId;
}
