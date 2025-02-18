import type { Action } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import type { BAMMActionParams } from "../types";
import { InputParserService } from "../services/input-parser";
import dedent from "dedent";
import { REPAY_TEMPLATE } from "../lib/templates";
import { WalletService } from "../services/wallet";
import { RepayService } from "../services/repay";
import formatNumber from "../lib/format-number";

export const getRepayAction = (opts: BAMMActionParams): Action => {
	return {
		name: "BAMM_REPAY",
		description: "Repay borrowed assets from a BAMM pool",
		similes: ["REPAY", "RETURN", "PAY_BACK", "REPAY_LOAN"],
		validate: async () => true,
		handler: handler(opts),
		examples: [],
	};
};

const handler = (opts: BAMMActionParams) => {
	return async (runtime, message, state, _options, callback) => {
		elizaLogger.info("Starting repay action");
		try {
			const inputParser = new InputParserService();
			const { bammAddress, borrowToken, amount, error } =
				await inputParser.parseInputs({
					runtime,
					message,
					state,
					template: REPAY_TEMPLATE,
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
			const repayService = new RepayService(walletService);

			const result = await repayService.execute({
				bammAddress,
				borrowToken,
				amount,
			});

			callback?.({
				text: dedent`
          ✅ Repayment Transaction Successful

          🏦 BAMM Address: ${bammAddress}
          🪙 Borrow Token: ${borrowToken}
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
