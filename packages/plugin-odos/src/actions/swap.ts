import type { Action, Handler } from "@elizaos/core";
import { GetQuoteActionService } from "../services/get-quote";
import type { OdosActionParams } from "../types";
import { AssembleService } from "../services/assemble";
import { WalletService } from "../services/wallet";
import { ExecuteSwapService } from "../services/execute-swap";

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
                return false;
            }

            const assembleService = new AssembleService(walletService);
            const txn = await assembleService.execute(quote.pathId);
            if (!txn) {
                callback?.({
                    text: `Error assembling transaction: ${txn}`,
                });
                return false;
            }

            const executeSwapService = new ExecuteSwapService(walletService);
            
            try {
                await executeSwapService.checkAndSetAllowance(
                    quote.inTokens[0],
                    BigInt(quote.inAmounts[0]),
                    txn.to
                );

                const hash = await executeSwapService.execute(txn);
                
                callback?.({
                    text: await executeSwapService.formatWithConfirmation(txn, hash),
                });

                return true;
            } catch (error) {
                callback?.({
                    text: `Error executing swap: ${error instanceof Error ? error.message : String(error)}`,
                });
                return false;
            }
        } catch (error) {
            callback?.({
                text: `Error in swap process: ${error instanceof Error ? error.message : String(error)}`,
            });
            return false;
        }
    };