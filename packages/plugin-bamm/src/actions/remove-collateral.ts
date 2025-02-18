import type { Action } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import type { BAMMActionParams } from "../types";
import { RemoveCollateralService } from "../services/remove-collateral";
import { InputParserService } from "../services/input-parser";
import dedent from "dedent";
import formatNumber, { formatWeiToNumber } from "../lib/format-number";
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
		examples: [],
	};
};

const handler = (opts: BAMMActionParams) => {
	return async (runtime, message, state, _options, callback) => {
		elizaLogger.info("Starting remove collateral action");
		try {
			const inputParser = new InputParserService();
			// Use the updated template and expect bammAddress, collateralToken, and amount
			const { bammAddress, collateralToken, amount, error } =
				await inputParser.parseInputs({
					runtime,
					message,
					state,
					template: REMOVE_COLLATERAL_TEMPLATE,
				});
			elizaLogger.info(`
				🔍 Parsed Inputs for remove collateral
				BAMM Address: ${bammAddress}
				Collateral Token: ${collateralToken}
				Amount: ${amount}
				`);
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
				amount,
			});

			callback?.({
				text: dedent`
          ✅ Collateral Removal Successful

					🔓 BAMM Address: ${bammAddress}
          🔓 Amount: ${formatNumber(amount)} tokens
					🔓 Collateral Token: ${collateralToken}
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
