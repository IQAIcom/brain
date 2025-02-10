import type { Action, Handler } from "@elizaos/core";
import { GetQuoteActionService } from "../services/get-quote";
import type { OdosActionParams } from "../types";
import { WalletService } from "../services/wallet";

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
	(opts) => async (runtime, message, state, _options, callback) => {
		try {
			const walletService = new WalletService(
				opts.walletPrivateKey,
				opts.chain,
			);
			const service = new GetQuoteActionService(walletService);
			const quote = await service.execute(runtime, message, state);
			if (quote instanceof Error) {
				callback?.({
					text: `Error fetching quote: ${quote.message}`,
				});
				return false
			}
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
