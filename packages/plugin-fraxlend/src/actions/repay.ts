import type { Action, Handler } from "@elizaos/core";
import { WITHDRAW_TEMPLATE } from "../lib/templates";
import { InputParserService } from "../services/input-parser";
import { RepayService } from "../services/repay";
import { WalletService } from "../services/wallet";
import type { FraxLendActionParams } from "../types";

export const getRepayAction = (opts: FraxLendActionParams): Action => {
	return {
		name: "FRAXLEND_REPAY",
		description: "Repay borrowed assets to a FraxLend pool",
		similes: [
			"REPAY",
			"PAY_BACK",
			"RETURN_LOAN",
			"SETTLE_DEBT",
			"CLEAR_LOAN",
			"REPAY_DEBT",
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
			const repayService = new RepayService(walletService);

			const result = await repayService.execute({
				pairAddress,
				amount: BigInt(amount),
			});

			callback?.({
				text: `Successfully repaid ${amount} tokens. Transaction hash: ${result.txHash}`,
				content: result,
			});
			return true;
		} catch (error) {
			callback?.({
				text: `Error during repayment: ${error.message}`,
			});
			return false;
		}
	};
