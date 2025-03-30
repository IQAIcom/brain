import {
	ModelClass,
	composeContext,
	generateMessageResponse,
} from "@elizaos/core";

export class InputParserService {
	async parseInputs({ runtime, message, state, template, functionMetadata }) {
		const currentState = state
			? await runtime.updateRecentMessageState(state)
			: await runtime.composeState(message);

		// Add function specific details to the template
		const enhancedTemplate = `${template}
  Function: ${functionMetadata.name}
  Inputs: ${JSON.stringify(functionMetadata.inputs)}
  Expected format: Array of arguments matching the inputs.`;

		const context = composeContext({
			state: currentState,
			template: enhancedTemplate,
		});

		const content = await generateMessageResponse({
			runtime,
			context,
			modelClass: ModelClass.SMALL,
		});

		return content as any;
	}
}
