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
		examples: [
			[
				{
					user: "user",
					content: {
						text: "borrow 5k of 0xCc3023635dF54FC0e43F47bc4BeB90c3d1fbDa9f from this 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84 bamm",
					},
				},
				{
					user: "system",
					content: {
						text: `
							✅ Borrowing Transaction Successful
							🌐 BAMM Address: 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84
							💸 Borrow Amount: 5.00K
							💰 Borrowed Token: 0xCc3023635dF54FC0e43F47bc4BeB90c3d1fbDa9f
							🔗 Transaction: 0xa1f64e3cd4b3a2afd5cec80c344df082492097b6db6a5075a34b6792d374bcf1

						  Funds have been borrowed from the BAMM pool.
						`,
					},
				},
			],
			[
				{
					user: "user",
					content: {
						text: "borrow 5k of CABU from this 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84 bamm",
					},
				},
				{
					user: "system",
					content: {
						text: `
							✅ Borrowing Transaction Successful
							🌐 BAMM Address: 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84
							💸 Borrow Amount: 5.00K
							💰 Borrowed Token: CABU
							🔗 Transaction: 0xa1f64e3cd4b3a2afd5cec80c344df082492097b6db6a5075a34b6792d374bcf1

						  Funds have been borrowed from the BAMM pool.
						`,
					},
				},
			],
		],
	};
};

const handler = (opts: BAMMActionParams) => {
	return async (runtime, message, state, _options, callback) => {
		elizaLogger.info("Starting borrow action");
		try {
			const inputParser = new InputParserService();
			// collateralToken is no longer needed in the input
			const { bammAddress, borrowToken, borrowTokenSymbol, amount, error } =
				await inputParser.parseInputs({
					runtime,
					message,
					state,
					template: BORROW_TEMPLATE,
				});
			elizaLogger.info(
				`
				Borrow params:
					bammAddress: ${bammAddress}
					borrowToken: ${borrowToken}
					borrowTokenSymbol: ${borrowTokenSymbol}
					amount: ${amount}
					error: ${error}
				`,
			);
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
				borrowTokenSymbol,
				amount,
			});

			callback?.({
				text: dedent`
          ✅ Borrowing Transaction Successful

					🌐 BAMM Address: ${bammAddress}
          💸 Borrow Amount: ${formatNumber(amount)}
					💰 Borrowed Token: ${borrowToken ?? borrowTokenSymbol}
          🔗 Transaction: ${result.txHash}

          Funds have been borrowed from the BAMM pool.
        `,
			});
			return true;
		} catch (error) {
			// Improved error message
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
