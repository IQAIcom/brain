import type { Action, Handler } from "@elizaos/core";
import { GetQuoteActionService } from "../services/get-quote";
import type { OdosActionParams } from "../types";
import { InputParserService } from "../services/input-parser";
import { EXCHANGE_TEMPLATE } from "../lib/templates";
import { Address } from "viem";

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
		const parsedOutput = await inputParser.parseInputs({
			runtime,
			message,
			state,
			template: EXCHANGE_TEMPLATE,
		});

		if('error' in parsedOutput){
			callback?.({
				text: `Error fetching quote: ${parsedOutput.error}`,
			});
			return false;	
		}

		const { fromToken, toToken, chainId, amount } = parsedOutput

		try {
			const service = new GetQuoteActionService();
			const quote = await service.execute(fromToken as Address, toToken as Address, chainId, amount);

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
