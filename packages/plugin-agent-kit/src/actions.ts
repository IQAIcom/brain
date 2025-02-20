import type { CdpAgentkit } from "@coinbase/cdp-agentkit-core";
import type { Tool } from "@coinbase/cdp-langchain";
import {
	type Action,
	type HandlerCallback,
	type IAgentRuntime,
	type Memory,
	ModelClass,
	type State,
	generateObject,
	generateText,
} from "@elizaos/core";
import { ContextComposer } from "./services/context-composer.ts";
import { ToolService } from "./services/tool-service.ts";
import type { ActionResult, AgentKitActionParams } from "./types.ts";

export async function getAgentKitActions({
	getClient,
}: AgentKitActionParams): Promise<Action[]> {
	const agentkit = await getClient();
	const toolService = new ToolService(agentkit);
	const tools = toolService.getTools();

	return tools.map((tool) => createAction(tool, getClient));
}

function createAction(
	tool: Tool,
	getClient: () => Promise<CdpAgentkit>,
): Action {
	return {
		name: tool.name.toUpperCase(),
		description: tool.description,
		similes: [],
		validate: async () => true,
		handler: createActionHandler(tool, getClient),
		examples: [],
	};
}

async function executeAction(
	tool: Tool,
	getClient: () => Promise<CdpAgentkit>,
	runtime: IAgentRuntime,
	message: Memory,
	state?: State,
): Promise<ActionResult> {
	const client = await getClient();
	const toolService = new ToolService(client);

	const currentState = state ?? (await runtime.composeState(message));
	const updatedState = await runtime.updateRecentMessageState(currentState);
	const contextComposer = new ContextComposer();

	const parameterContext = contextComposer.forParameters(tool, updatedState);
	const parameters = (await generateParameters(
		runtime,
		parameterContext,
		tool,
	)) as string | Record<string, unknown>;

	const result = await toolService.executeTool(tool, parameters);

	const responseContext = contextComposer.forResponse(
		tool,
		result,
		updatedState,
	);
	const response = await generateResponse(runtime, responseContext);

	return { response, content: result };
}

function createActionHandler(
	tool: Tool,
	getClient: () => Promise<CdpAgentkit>,
) {
	return async (
		runtime: IAgentRuntime,
		message: Memory,
		state: State | undefined,
		_options?: Record<string, unknown>,
		callback?: HandlerCallback,
	): Promise<boolean> => {
		try {
			const result = await executeAction(
				tool,
				getClient,
				runtime,
				message,
				state,
			);
			callback?.({ text: result.response, content: result.content });
			return true;
		} catch (error) {
			handleError(error, tool.name, callback);
			return false;
		}
	};
}

async function generateParameters(
	runtime: IAgentRuntime,
	context: string,
	tool: Tool,
): Promise<unknown> {
	const { object } = await generateObject({
		runtime,
		context,
		modelClass: ModelClass.LARGE,
		schema: tool.schema as any,
	});
	return object;
}

async function generateResponse(
	runtime: IAgentRuntime,
	context: string,
): Promise<string> {
	return generateText({
		runtime,
		context,
		modelClass: ModelClass.LARGE,
	});
}

function handleError(
	error: unknown,
	toolName: string,
	callback?: HandlerCallback,
): void {
	const errorMessage = error instanceof Error ? error.message : String(error);
	callback?.({
		text: `Error executing action ${toolName}: ${errorMessage}`,
		content: { error: errorMessage },
	});
}
