import type { Action } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import dedent from "dedent";
import formatNumber from "../lib/format-number";
import { ADD_COLLATERAL_TEMPLATE } from "../lib/templates";
import { AddCollateralService } from "../services/add-collateral";
import { InputParserService } from "../services/input-parser";
import { WalletService } from "../services/wallet";
import type { BAMMActionParams } from "../types";

export const getAddCollateralAction = (opts: BAMMActionParams): Action => {
	return {
		name: "BAMM_ADD_COLLATERAL",
		description: "Add collateral to your BAMM position",
		similes: [
			"ADD_COLLATERAL",
			"DEPOSIT_COLLATERAL",
			"INCREASE_COLLATERAL",
			"TOP_UP_COLLATERAL",
		],
		validate: async () => true,
		handler: handler(opts),
		examples: [
			[
				{
					user: "user",
					content: {
						text: "add 100k collateral of 0xCc3023635dF54FC0e43F47bc4BeB90c3d1fbDa9f to this 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84 bamm",
					},
				},
				{
					user: "system",
					content: {
						text: `
							✅ Collateral Addition Successful

							🌐 BAMM Address: 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84
							🔒 Amount: 100.00K tokens
							💰 Token: 0xCc3023635dF54FC0e43F47bc4BeB90c3d1fbDa9f
							🔗 Transaction: 0x1194ed3524f3cab3f8f5fbf55ef218c224fce026ad7fb5d612139439e58a43ef

							Collateral has been added to your BAMM position.
							`,
					},
				},
			],
			[
				{
					user: "user",
					content: {
						text: "add 100k collateral of IQT to this 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84 bamm",
					},
				},
				{
					user: "system",
					content: {
						text: `
							✅ Collateral Addition Successful

							🌐 BAMM Address: 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84
							🔒 Amount: 100.00K tokens
							💰 Token: IQT
							🔗 Transaction: 0x1194ed3524f3cab3f8f5fbf55ef218c224fce026ad7fb5d612139439e58a43ef

							Collateral has been added to your BAMM position.
							`,
					},
				},
			],
		],
	};
};

const handler = (opts: BAMMActionParams) => {
	return async (runtime, message, state, _options, callback) => {
		elizaLogger.info("Starting add collateral action");
		try {
			const inputParser = new InputParserService();
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
				template: ADD_COLLATERAL_TEMPLATE,
			});
			elizaLogger.info(
				`
				Add collateral params:
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
			const addCollateralService = new AddCollateralService(walletService);

			const result = await addCollateralService.execute({
				bammAddress,
				collateralToken,
				collateralTokenSymbol,
				amount: amount,
			});

			callback?.({
				text: dedent`
          ✅ Collateral Addition Successful

					🌐 BAMM Address: ${bammAddress}
          🔒 Amount: ${formatNumber(amount)}
					💰 Token: ${collateralTokenSymbol ?? collateralToken}
          🔗 Transaction: ${result.txHash}

          Collateral has been added to your BAMM position.
        `,
			});
			return true;
		} catch (error) {
			callback?.({
				text: dedent`
          ❌ Collateral Addition Failed

          Error: ${error.message}

          Please verify your inputs and try again.
        `,
			});
			return false;
		}
	};
};
