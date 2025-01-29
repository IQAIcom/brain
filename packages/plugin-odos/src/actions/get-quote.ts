import type { Action, Handler } from "@elizaos/core";
import { GetQuoteActionService } from "../services/get-quote";
import type { OdosActionParams } from "../types";
import { InputParserService } from "../services/input-parser";
import { EXCHANGE_TEMPLATE } from "../lib/templates";

export const getQuoteAction = (opts: OdosActionParams): Action => {
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

const handler: (opts: OdosActionParams) => Handler =
	() => async (runtime, message, state, _options, callback) => {
		const inputParser = new InputParserService();
		const { fromToken, toToken, chain, amount } = await inputParser.parseInputs({
			runtime,
			message,
			state,
			template: EXCHANGE_TEMPLATE,
		});
		try {
			const service = new GetQuoteActionService();
			const quote = await service.execute(fromToken, toToken, chain, amount);

			callback?.({
				text: service.format(quote),
			});
			return true;
		} catch (error) {
			callback?.({
				text: `Error fetching quote: ${error.message}`,
			});
			return false;
		}
	};
