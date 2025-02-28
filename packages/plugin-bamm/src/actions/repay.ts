import type { Action } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import dedent from "dedent";
import formatNumber from "../lib/format-number";
import { REPAY_TEMPLATE } from "../lib/templates";
import { InputParserService } from "../services/input-parser";
import { RepayService } from "../services/repay";
import { WalletService } from "../services/wallet";
import type { BAMMActionParams } from "../types";

export const getRepayAction = (opts: BAMMActionParams): Action => {
	return {
		name: "BAMM_REPAY",
		description: "Repay borrowed assets from a BAMM pool",
		similes: ["REPAY", "RETURN", "PAY_BACK", "REPAY_LOAN"],
		validate: async () => true,
		handler: handler(opts),
		examples: [
			[
				{
					user: "user",
					content: {
						text: "repay 3k of 0xCc3023635dF54FC0e43F47bc4BeB90c3d1fbDa9f to this 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84 bamm",
					},
				},
				{
					user: "system",
					content: {
						text: `
							✅ Repayment Transaction Successful

							🏦 BAMM Address: 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84
							🪙 Borrow Token: 0xCc3023635dF54FC0e43F47bc4BeB90c3d1fbDa9f
							💰 Amount: 3.00K
							🔗 Transaction: 0x89085633b5f34ff7d441b607b6e31025a85dde80b99a60059bc381199dcaba46

							Borrowed assets have been successfully repaid to the BAMM pool.
						`,
					},
				},
			],
			[
				{
					user: "user",
					content: {
						text: "repay 3k of CABU to this 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84 bamm",
					},
				},
				{
					user: "system",
					content: {
						text: `
							✅ Repayment Transaction Successful

							🏦 BAMM Address: 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84
							🪙 Borrow Token: CABU
							💰 Amount: 3.00K
							🔗 Transaction: 0x89085633b5f34ff7d441b607b6e31025a85dde80b99a60059bc381199dcaba46

							Borrowed assets have been successfully repaid to the BAMM pool.
						`,
					},
				},
			],
		],
	};
};

const handler = (opts: BAMMActionParams) => {
	return async (runtime, message, state, _options, callback) => {
		elizaLogger.info("Starting repay action");
		try {
			const inputParser = new InputParserService();
			const { bammAddress, borrowToken, borrowTokenSymbol, amount, error } =
				await inputParser.parseInputs({
					runtime,
					message,
					state,
					template: REPAY_TEMPLATE,
				});
			elizaLogger.info(
				`
				Repay params:
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
			const repayService = new RepayService(walletService);

			const result = await repayService.execute({
				bammAddress,
				borrowToken,
				borrowTokenSymbol,
				amount,
			});

			callback?.({
				text: dedent`
          ✅ Repayment Transaction Successful

          🏦 BAMM Address: ${bammAddress}
          🪙 Borrow Token: ${borrowTokenSymbol ?? borrowToken}
					💰 Amount: ${formatNumber(amount)}
          🔗 Transaction: ${result.txHash}

          Borrowed assets have been successfully repaid to the BAMM pool.
        `,
			});
			return true;
		} catch (error) {
			callback?.({
				text: dedent`
          ❌ Repayment Transaction Failed

          Error: ${error.message}

          Please verify your inputs and try again.
        `,
			});
			return false;
		}
	};
};
