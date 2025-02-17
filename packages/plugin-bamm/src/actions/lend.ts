import type { Action } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import type { BAMMActionParams } from "../types";
import { InputParserService } from "../services/input-parser";
import dedent from "dedent";
import { LEND_TEMPLATE } from "../lib/templates";
import { WalletService } from "../services/wallet";
import { LendService } from "../services/lend";

export const getLendAction = (opts: BAMMActionParams): Action => {
	return {
		name: "BAMM_LEND",
		description: "Lend assets to a BAMM pool",
		similes: ["LEND", "SUPPLY", "DEPOSIT", "PROVIDE_LIQUIDITY"],
		validate: async () => true,
		handler: handler(opts),
		examples: [],
	};
};

const handler = (opts: BAMMActionParams) => {
	return async (runtime, message, state, _options, callback) => {
		elizaLogger.info("Starting lend action");
		try {
			const inputParser = new InputParserService();
			const { bammAddress, tokenAddress, amount, error } =
				await inputParser.parseInputs({
					runtime,
					message,
					state,
					template: LEND_TEMPLATE,
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
			const lendService = new LendService(walletService);

			const result = await lendService.execute({
				bammAddress,
				tokenAddress,
				amount,
			});

			callback?.({
				text: dedent`
          ✅ Lending Transaction Successful

          🏦 BAMM Address: ${bammAddress}
          🪙 Token Address: ${tokenAddress}
          💰 Amount Lent: ${amount}
          🔗 Transaction: ${result.txHash}

          Tokens have been successfully lent to the BAMM pool.
        `,
			});
			return true;
		} catch (error) {
			callback?.({
				text: dedent`
          ❌ Lending Transaction Failed

          Error: ${error.message}

          Please verify your inputs and try again.
        `,
			});
			return false;
		}
	};
};
