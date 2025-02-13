import {
	ModelClass,
	composeContext,
	generateMessageResponse,
} from "@elizaos/core";

export class InputParserService {
	async parseInputs({ runtime, message, state, template }) {
		const currentState = state
			? await runtime.updateRecentMessageState(state)
			: await runtime.composeState(message);

		const context = composeContext({
			state: currentState,
			template,
		});

		console.log("ℹ️ Current State:", context);

		const content = await generateMessageResponse({
			runtime,
			context,
			modelClass: ModelClass.SMALL,
		});

		return content as any;
	}
}
