import type { Action } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import type { BAMMActionParams } from "../types";
import { WithdrawService } from "../services/withdraw";
import { InputParserService } from "../services/input-parser";
import dedent from "dedent";
import formatNumber from "../lib/format-number";
import { WITHDRAW_TEMPLATE } from "../lib/templates";
import { WalletService } from "../services/wallet";

export const getWithdrawAction = (opts: BAMMActionParams): Action => {
	return {
		name: "BAMM_WITHDRAW",
		description: "Withdraw LP tokens from BAMM pool by redeeming BAMM tokens.",
		similes: [
			"WITHDRAW",
			"REMOVE_LIQUIDITY",
			"EXIT_POOL",
			"PULL_LIQUIDITY",
			"WITHDRAW_LP",
			"REDEEM_BAMM",
		],
		validate: async () => true,
		handler: handler(opts),
		examples: [
			[
				{
					user: "user",
					content: {
						text: "withdraw 15k bamm tokens from 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84",
					},
				},
				{
					user: "system",
					content: {
						text: `
							✅ Withdrawal Successful

							💰 Amount: 15.00K BAMM tokens redeemed
							🔗 Transaction: 0xd23acc3267cbbd46f09af8471463327ac056cfbbba53c4199d110cb6d730a121

							Bamm tokens have been withdrawn from the BAMM pool and converted to LP tokens.
						`,
					},
				},
			],
		],
	};
};

const handler = (opts: BAMMActionParams) => {
	return async (runtime, message, state, _options, callback) => {
		elizaLogger.info("Starting withdraw action");
		try {
			const inputParser = new InputParserService();
			const { bammAddress, amount, error } = await inputParser.parseInputs({
				runtime,
				message,
				state,
				template: WITHDRAW_TEMPLATE,
			});
			elizaLogger.info(
				`
      	Withdraw Params:
					BAMM Address: ${bammAddress}
					Amount: ${amount}
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
			const withdrawService = new WithdrawService(walletService);

			const result = await withdrawService.execute({
				bammAddress,
				amount,
			});

			callback?.({
				text: dedent`
          ✅ Withdrawal Successful

          💰 Amount: ${formatNumber(amount)} BAMM tokens redeemed
          🔗 Transaction: ${result.txHash}

          Bamm tokens have been withdrawn from the BAMM pool and converted to LP tokens.
        `,
			});
			return true;
		} catch (error) {
			callback?.({
				text: dedent`
          ❌ Withdrawal Failed

          Error: ${error.message}

          Please verify your inputs and try again.
        `,
			});
			return false;
		}
	};
};
