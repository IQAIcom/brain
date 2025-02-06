import type { Action, Handler } from "@elizaos/core";
import { GetQuoteActionService } from "../services/get-quote";
import type { OdosActionParams } from "../types";
import { AssembleService } from "../services/assemble";
import { WalletService } from "../../../plugin-fraxlend/src/services/wallet";
import { ExecuteSwapService } from "../services/execute-swap";

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
	(opts) => async (runtime, message, state, _options, callback) => {
		try {
			const getQuoteService = new GetQuoteActionService();
			const quote = await getQuoteService.execute(runtime, message, state, callback);

			if (quote instanceof Error || !quote.pathId) {
				callback?.({
					text: `Error fetching quote: ${quote instanceof Error ? quote.message : String(quote)}`,
				});
				return false
			}
			const walletService = new WalletService(
				opts.walletPrivateKey,
				opts.chain,
			);
			const txn = await new AssembleService(walletService).execute(quote.pathId);
			if (!txn) {
				callback?.({
					text: `Error assembling transaction: ${txn}`,
				});
				return false;
			}
			const hash = await new ExecuteSwapService(walletService).execute(txn);

			callback?.({
                text: `Swap executed successfully. Transaction hash: ${hash}`,
            });


			return true;
		} catch (error) {
			callback?.({
				text: `Error fetching quote: ${error instanceof Error ? error.message : String(error)}`,
			});
			return false;
		}
	};