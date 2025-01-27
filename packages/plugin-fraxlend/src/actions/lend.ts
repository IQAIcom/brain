import {
	type Action,
	type Handler,
	ModelClass,
	composeContext,
	generateMessageResponse,
} from "@elizaos/core";
import { LEND_TEMPLATE } from "../lib/templates";
import { LendService } from "../services/lend";
import { WalletService } from "../services/wallet";
import type { FraxLendActionParams } from "../types";

export const getLendAction = (opts: FraxLendActionParams): Action => {
	return {
		name: "FRAXLEND_LEND",
		description: "Lend assets to a FraxLend pool",
		similes: [
			"LEND",
			"SUPPLY",
			"PROVIDE_ASSETS",
			"LOAN_ASSETS",
			"SUPPLY_TOKENS",
			"LEND_TOKENS",
		],
		validate: async () => true,
		handler: handler(opts),
		examples: [],
	};
};

const handler: (opts: FraxLendActionParams) => Handler =
	({ walletPrivateKey }) =>
	async (runtime, message, state, _options, callback) => {
		const currentState = state
			? await runtime.updateRecentMessageState(state)
			: await runtime.composeState(message);

		const depositContext = composeContext({
			state: currentState,
			template: LEND_TEMPLATE,
		});

		const content = await generateMessageResponse({
			runtime,
			context: depositContext,
			modelClass: ModelClass.SMALL,
		});

		const { pairAddress, amount } = JSON.parse(content.text) || {};

		try {
			const walletService = new WalletService(walletPrivateKey);
			const lendService = new LendService(walletService);

			const result = await lendService.execute({
				pairAddress,
				amount: BigInt(amount),
			});

			callback?.({
				text: `Successfully lent ${amount} tokens. Transaction hash: ${result.data.txHash}`,
				content: result,
			});
			return true;
		} catch (error) {
			callback?.({
				text: `Error during lending: ${error.message}`,
				content: { error: error.message },
			});
			return false;
		}
	};
