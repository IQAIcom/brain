import type { Action, Handler } from "@elizaos/core";
import { GetQuoteActionService } from "../services/get-quote";
import type { OdosActionParams } from "../types";

export const swapAction = (opts: OdosActionParams): Action => {
	return {
		name: "ODOS_SWAP",
		description: "Execute a swap transaction",
		similes: [
			"GET_QUOTE",
			"EXCHANGE_TOKENS",
			"PRICE_CHECK",
			"GET_PRICE",
			"CHECK_PRICE",
			"GET_RATE",
			"CHECK_RATE",
			"GET_EXCHANGE_RATE",
			"CHECK_EXCHANGE_RATE",
		],
		validate: async () => true,
		handler: handler(opts),
		examples: [],
	};
};

const handler: (opts: OdosActionParams) => Handler =
	() => async (runtime, message, state, _options, callback) => {
		try {
			const getQuoteService = new GetQuoteActionService();
			const quote = await getQuoteService.execute(runtime, message, state, callback);

			if (quote instanceof Error) {
				callback?.({
					text: `Error fetching quote: ${quote.message}`,
				});
				return false
			}

			return true;
		} catch (error) {
			callback?.({
				text: `Error fetching quote: ${error.message}`,
			});
			return false;
		}
	};
