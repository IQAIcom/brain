import type { Action, Handler } from "@elizaos/core";
import { WITHDRAW_TEMPLATE } from "../lib/templates";
import { InputParserService } from "../services/input-parser";
import { BorrowService } from "../services/borrow";
import { WalletService } from "../services/wallet";
import type { FraxLendActionParams } from "../types";

export const getBorrowAction = (opts: FraxLendActionParams): Action => {
	return {
		name: "FRAXLEND_BORROW",
		description: "Borrow assets from a FraxLend pool",
		similes: [
			"BORROW",
			"GET_LOAN",
			"TAKE_LOAN",
			"REQUEST_FUNDS",
			"OBTAIN_ASSETS",
			"LEVERAGE",
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
			const borrowService = new BorrowService(walletService);

			const result = await borrowService.execute({
				pairAddress,
				amount: BigInt(amount),
			});

			callback?.({
				text: `Successfully borrowed ${amount} tokens. Transaction hash: ${result.data.txHash}`,
				content: result,
			});
			return true;
		} catch (error) {
			callback?.({
				text: `Error during borrowing: ${error.message}`,
				content: { error: error.message },
			});
			return false;
		}
	};
