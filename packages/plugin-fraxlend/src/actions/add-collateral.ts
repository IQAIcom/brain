import type { Action, Handler } from "@elizaos/core";
import { WITHDRAW_TEMPLATE } from "../lib/templates";
import { InputParserService } from "../services/input-parser";
import { AddCollateralService } from "../services/add-collateral";
import { WalletService } from "../services/wallet";
import type { FraxLendActionParams } from "../types";

export const getAddCollateralAction = (opts: FraxLendActionParams): Action => {
	return {
		name: "FRAXLEND_ADD_COLLATERAL",
		description: "Add collateral to a FraxLend position",
		similes: [
			"ADD_COLLATERAL",
			"DEPOSIT_COLLATERAL",
			"INCREASE_COLLATERAL",
			"SECURE_POSITION",
			"BOOST_COLLATERAL",
		],
		validate: async () => true,
		handler: handler(opts),
		examples: [],
	};
};

const handler: (opts: FraxLendActionParams) => Handler =
	({ walletPrivateKey, chain }) =>
	async (runtime, message, state, _options, callback) => {
		const inputParser = new InputParserService();
		const { pairAddress, amount } = await inputParser.parseInputs({
			runtime,
			message,
			state,
			template: WITHDRAW_TEMPLATE,
		});

		try {
			const walletService = new WalletService(walletPrivateKey, chain);
			const addCollateralService = new AddCollateralService(walletService);

			const result = await addCollateralService.execute({
				pairAddress,
				amount: BigInt(amount),
			});

			callback?.({
				text: `Successfully added ${amount} collateral. Transaction hash: ${result.txHash}`,
			});
			return true;
		} catch (error) {
			callback?.({
				text: `Error adding collateral: ${error.message}`,
			});
			return false;
		}
	};
