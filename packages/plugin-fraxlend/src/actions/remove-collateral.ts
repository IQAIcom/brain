import type { Action, Handler } from "@elizaos/core";
import dedent from "dedent";
import { formatWeiToNumber } from "../lib/format-number";
import { WITHDRAW_TEMPLATE } from "../lib/templates";
import { InputParserService } from "../services/input-parser";
import { RemoveCollateralService } from "../services/remove-collateral";
import { WalletService } from "../services/wallet";
import type { FraxLendActionParams } from "../types";

export const getRemoveCollateralAction = (
	opts: FraxLendActionParams,
): Action => {
	return {
		name: "FRAXLEND_REMOVE_COLLATERAL",
		description: "Remove collateral from a FraxLend position",
		similes: [
			"REMOVE_COLLATERAL",
			"WITHDRAW_COLLATERAL",
			"DECREASE_COLLATERAL",
			"PULL_COLLATERAL",
			"REDUCE_COLLATERAL",
		],
		validate: async () => true,
		handler: handler(opts),
		examples: [],
	};
};

const handler: (opts: FraxLendActionParams) => Handler =
	(opts) => async (runtime, message, state, _options, callback) => {
		const inputParser = new InputParserService();
		const { pairAddress, amount } = await inputParser.parseInputs({
			runtime,
			message,
			state,
			template: WITHDRAW_TEMPLATE,
		});

		try {
			const walletService = new WalletService(
				opts.walletPrivateKey,
				opts.chain,
			);
			const removeCollateralService = new RemoveCollateralService(
				walletService,
			);

			const result = await removeCollateralService.execute({
				pairAddress,
				amount: BigInt(amount),
			});

			callback?.({
				text: dedent`
					✅ Collateral Removal Successful

					🔓 Amount: ${formatWeiToNumber(amount)} tokens
					🔗 Transaction: ${result.txHash}

					Collateral has been removed from your FraxLend position.
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
