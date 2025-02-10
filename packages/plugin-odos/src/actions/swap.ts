import type { Action, Handler } from "@elizaos/core";
import { GetQuoteActionService } from "../services/get-quote";
import type { OdosActionParams } from "../types";
import { AssembleService } from "../services/assemble";
import { WalletService } from "../services/wallet";
import { ExecuteSwapService } from "../services/execute-swap";
import { ApprovalService } from "../services/allowance";
import type { Address } from "viem";
//TODO: Check why assebmle is reurning 400, make a simple script using odos guide to ceck it

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
			const walletService = new WalletService(
				opts.walletPrivateKey,
				opts.chain,
			);
			const getQuoteService = new GetQuoteActionService(walletService);
			const quote = await getQuoteService.execute(runtime, message, state);

			if (quote instanceof Error || !quote.pathId) {
				callback?.({
					text: `Error fetching quote: ${quote instanceof Error ? quote.message : String(quote)}`,
				});
				return false
			}
			console.log('userAddr', walletService.getWalletClient()?.account?.address)
			console.log('quote', quote)
			const assembleService = new AssembleService(walletService);
			const txn = await assembleService.execute(quote.pathId);
			if (!txn) {
				callback?.({
					text: `Error assembling transaction: ${txn}`,
				});
				return false;
			}
			// const approvalService = new ApprovalService(walletService);
			// await approvalService.execute(txn.from as Address, txn.to as Address, BigInt(quote.inAmounts[0]));

			const executeSwapService = new ExecuteSwapService(walletService)
			const hash = await executeSwapService.execute(txn);

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