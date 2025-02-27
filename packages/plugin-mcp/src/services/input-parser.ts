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

		const content = await generateMessageResponse({
			runtime,
			context,
			modelClass: ModelClass.SMALL,
		});

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		return content as any;
	}
}
