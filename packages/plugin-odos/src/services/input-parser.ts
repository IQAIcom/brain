import {
	ModelClass,
	composeContext,
	generateMessageResponse,
} from "@elizaos/core";
import type { Address } from "viem";

export class InputParserService {
	async parseInputs({ runtime, message, state, template }) {
		const currentState = state
			? await runtime.updateRecentMessageState(state)
			: await runtime.composeState(message);

		const context = composeContext({
			state: currentState,
			template,
		});

		const response = await generateMessageResponse({
			runtime,
			context,
			modelClass: ModelClass.SMALL,
		});

		if (response?.error) {
			const result = { error: response.error as string };
			return result;
		}

		const result = {
			fromToken: response.fromToken as Address,
			toToken: response.toToken as Address,
			amount: response.amount as string,
			chainId: Number(response.chain),
		};

		return result;
	}
}
