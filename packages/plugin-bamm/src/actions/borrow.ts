import type { Action } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import type { BAMMActionParams } from "../types";
import { InputParserService } from "../services/input-parser";
import dedent from "dedent";
import { BORROW_TEMPLATE } from "../lib/templates";
import { WalletService } from "../services/wallet";
import { BorrowService } from "../services/borrow";
import formatNumber from "../lib/format-number";

export const getBorrowAction = (opts: BAMMActionParams): Action => {
	return {
		name: "BAMM_BORROW",
		description: "Borrow assets from a BAMM pool using collateral",
		similes: ["BORROW", "GET_LOAN", "LEVERAGE", "TAKE_LOAN", "RENT_LIQUIDITY"],
		validate: async () => true,
		handler: handler(opts),
		examples: [],
	};
};

const handler = (opts: BAMMActionParams) => {
	return async (runtime, message, state, _options, callback) => {
		elizaLogger.info("Starting borrow action");
		try {
			const inputParser = new InputParserService();
			const { bammAddress, borrowToken, amount, collateralToken, error } =
				await inputParser.parseInputs({
					runtime,
					message,
					state,
					template: BORROW_TEMPLATE,
				});

			if (error) {
				callback?.({
					text: `❌ ${error}`,
				});
				return false;
			}

			const walletService = new WalletService(
				opts.walletPrivateKey,
				opts.chain,
			);
			const borrowService = new BorrowService(walletService);

			const result = await borrowService.execute({
				bammAddress,
				borrowToken,
				amount,
				collateralToken,
			});

			callback?.({
				text: dedent`
          ✅ Borrowing Transaction Successful

          💸 Borrow Amount: ${formatNumber(amount)} tokens
          🔒 Collateral Token: ${collateralToken}
          🔗 Transaction: ${result.txHash}

          Funds have been borrowed from the BAMM pool.
        `,
			});
			return true;
		} catch (error) {
			callback?.({
				text: dedent`
          ❌ Borrowing Transaction Failed

          Error: ${error.message}

          Please verify your inputs and try again.
        `,
			});
			return false;
		}
	};
};
