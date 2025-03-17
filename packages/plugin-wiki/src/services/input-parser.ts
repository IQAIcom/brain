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

		if (content?.error) {
			const result = { error: content.error as string };
			return result;
		}
		console.log(content);
		const result = { id: content.id as string };

		return result;
	}
}
