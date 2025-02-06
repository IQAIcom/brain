import type { Action, Handler } from "@elizaos/core";
import { GetQuoteActionService } from "../services/get-quote";
import type { OdosActionParams } from "../types";
import { AssembleService } from "../services/assemble";
import { RouterService } from "../services/get-router";
import { WalletService } from "../../../plugin-fraxlend/src/services/wallet";

export const swapAction = (opts: OdosActionParams): Action => {
	return {
		name: "ODOS_SWAP",
		description: "Execute a swap transaction",
		similes: [
			"SWAP_TOKENS",
            "EXECUTE_SWAP",
            "PERFORM_SWAP",
            "EXCHANGE_TOKENS", 
            "TRADE_TOKENS",
            "DO_SWAP",
            "MAKE_SWAP",
            "CONVERT_TOKENS"
		],
		validate: async () => true,
		handler: handler(opts),
		examples: [],
	};
};

const handler: (opts: OdosActionParams) => Handler =
	(opts) => async (runtime, message, state, _options, callback) => {
		try {
			const getQuoteService = new GetQuoteActionService();
			const quote = await getQuoteService.execute(runtime, message, state, callback);

			if (quote instanceof Error) {
				callback?.({
					text: `Error fetching quote: ${quote.message}`,
				});
				return false
			}
			const walletService = new WalletService(
				opts.walletPrivateKey,
				opts.chain,
			);
			const {data: txnCalldata} = await new AssembleService(walletService).execute(quote);
			const routerAddr = await new RouterService(opts.chain).execute();
			// TODO: execute transaction


			return true;
		} catch (error) {
			callback?.({
				text: `Error fetching quote: ${error.message}`,
			});
			return false;
		}
	};
