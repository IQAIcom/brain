import type { Action, Handler } from "@elizaos/core";
import { WITHDRAW_TEMPLATE } from "../lib/templates";
import { InputParserService } from "../services/input-parser";
import { WalletService } from "../services/wallet";
import { WithdrawService } from "../services/withdraw";
import type { FraxLendActionParams } from "../types";

export const getWithdrawAction = (opts: FraxLendActionParams): Action => {
	return {
		name: "FRAXLEND_WITHDRAW",
		description: "Withdraw assets from a FraxLend pool",
		similes: [
			"WITHDRAW",
			"REMOVE_LIQUIDITY",
			"PULL_ASSETS",
			"TAKE_OUT",
			"RETRIEVE_FUNDS",
			"EXIT_POOL",
			"UNSTAKE",
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
			const withdrawService = new WithdrawService(walletService);

			const result = await withdrawService.execute({
				pairAddress,
				amount: BigInt(amount),
			});

			callback?.({
				text: `Successfully withdrew ${amount}. Transaction hash: ${result.txHash}`,
			});
			return true;
		} catch (error) {
			callback?.({
				text: `Error during withdrawal: ${error.message}`,
			});
			return false;
		}
	};
