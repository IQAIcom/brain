import type { Action } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import type { BAMMActionParams } from "../types";
import { RemoveCollateralService } from "../services/remove-collateral";
import { InputParserService } from "../services/input-parser";
import dedent from "dedent";
import formatNumber from "../lib/format-number";
import { REMOVE_COLLATERAL_TEMPLATE } from "../lib/templates";
import { WalletService } from "../services/wallet";

export const getRemoveCollateralAction = (opts: BAMMActionParams): Action => {
	return {
		name: "BAMM_REMOVE_COLLATERAL",
		description: "Remove collateral from your BAMM position",
		similes: [
			"REMOVE_COLLATERAL",
			"WITHDRAW_COLLATERAL",
			"DECREASE_COLLATERAL",
			"PULL_COLLATERAL",
		],
		validate: async () => true,
		handler: handler(opts),
		examples: [
			[
				{
					user: "user",
					content: {
						text: "remove 10k collateral of 0xCc3023635dF54FC0e43F47bc4BeB90c3d1fbDa9f from this 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84 bamm",
					},
				},
				{
					user: "system",
					content: {
						text: `
							✅ Collateral Removal Successful

							🔓 BAMM Address: 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84
							🔓 Amount: 10.00K tokens
							🔓 Collateral Token: 0xCc3023635dF54FC0e43F47bc4BeB90c3d1fbDa9f
							🔗 Transaction: 0x853a87e832d7e0a4d3db1d9177914b50119331dd86db75426bdf1d34bba23e33

							Collateral has been removed from your BAMM position.
						`,
					},
				},
			],
			[
				{
					user: "user",
					content: {
						text: "remove 10k collateral of IQT from this 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84 bamm",
					},
				},
				{
					user: "system",
					content: {
						text: `
							✅ Collateral Removal Successful

							🔓 BAMM Address: 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84
							🔓 Amount: 10.00K tokens
							🔓 Collateral Token: IQT
							🔗 Transaction: 0x853a87e832d7e0a4d3db1d9177914b50119331dd86db75426bdf1d34bba23e33

							Collateral has been removed from your BAMM position.
						`,
					},
				},
			],
		],
	};
};

const handler = (opts: BAMMActionParams) => {
	return async (runtime, message, state, _options, callback) => {
		elizaLogger.info("Starting remove collateral action");
		try {
			const inputParser = new InputParserService();
			// Use the updated template and expect bammAddress, collateralToken, and amount
			const {
				bammAddress,
				collateralToken,
				collateralTokenSymbol,
				amount,
				error,
			} = await inputParser.parseInputs({
				runtime,
				message,
				state,
				template: REMOVE_COLLATERAL_TEMPLATE,
			});
			elizaLogger.info(
				`
				Remove collateral params:
					bammAddress: ${bammAddress}
					collateralToken: ${collateralToken}
					collateralTokenSymbol: ${collateralTokenSymbol}
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
			const removeCollateralService = new RemoveCollateralService(
				walletService,
			);

			// Pass the correct parameters to the service
			const result = await removeCollateralService.execute({
				bammAddress,
				collateralToken,
				collateralTokenSymbol,
				amount,
			});

			callback?.({
				text: dedent`
          ✅ Collateral Removal Successful

					🔓 BAMM Address: ${bammAddress}
          🔓 Amount: ${formatNumber(amount)} tokens
					🔓 Collateral Token: ${collateralToken ?? collateralTokenSymbol}
          🔗 Transaction: ${result.txHash}

          Collateral has been removed from your BAMM position.
        `,
			});
			return true;
		} catch (error) {
			callback?.({
				text: dedent`
          ❌ Collateral Removal Failed

          Error: ${error.message}

          Please verify your inputs and try again.
        `,
			});
			return false;
		}
	};
};
