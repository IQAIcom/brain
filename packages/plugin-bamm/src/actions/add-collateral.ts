import type { Action } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import type { BAMMActionParams } from "../types";
import { AddCollateralService } from "../services/add-collateral";
import dedent from "dedent";
import formatNumber, { formatWeiToNumber } from "../lib/format-number";
import { WalletService } from "../services/wallet";
import { ADD_COLLATERAL_TEMPLATE } from "../lib/templates";
import { InputParserService } from "../services/input-parser";

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
		examples: [],
	};
};

const handler = (opts: BAMMActionParams) => {
	return async (runtime, message, state, _options, callback) => {
		elizaLogger.info("Starting add collateral action");
		try {
			const inputParser = new InputParserService();
			const { bammAddress, collateralToken, amount, error } =
				await inputParser.parseInputs({
					runtime,
					message,
					state,
					template: ADD_COLLATERAL_TEMPLATE,
				});

			if (error) {
				callback?.({
					text: `❌ ${error}`,
				});
				return false;
			}
			elizaLogger.info(
				`🔗 BAMM Address: ${bammAddress}`,
				`💰 Collateral Token: ${collateralToken}`,
				`💰 Amount: ${amount}`,
			);
			const walletService = new WalletService(
				opts.walletPrivateKey,
				opts.chain,
			);
			const addCollateralService = new AddCollateralService(walletService);

			const result = await addCollateralService.execute({
				bammAddress,
				collateralToken,
				amount: amount,
			});

			callback?.({
				text: dedent`
          ✅ Collateral Addition Successful

					🌐 BAMM Address: ${bammAddress}
          🔒 Amount: ${formatNumber(amount)} tokens
					💰 Token: ${collateralToken}
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
