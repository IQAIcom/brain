import type { Action, Handler } from "@elizaos/core";
import { GetQuoteActionService } from "../services/get-quote";
import type { FraxLendActionParams } from "../types";

export const getQuoteAction = (opts: FraxLendActionParams): Action => {
	return {
		name: "ODOS_GET_QUOTE",
		description: "Get a quote for a swap or exchange operation",
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

const handler: (opts: FraxLendActionParams) => Handler =
	() => async (_runtime, _message, _state, _options, callback) => {
		try {
			const service = new GetQuoteActionService();
			const stats = await service.getQuote();

			callback?.({
				text: service.format(stats),
			});
			return true;
		} catch (error) {
			callback?.({
				text: `Error fetching quotes: ${error.message}`,
			});
			return false;
		}
	};
