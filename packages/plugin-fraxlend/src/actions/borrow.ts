import type { Action, Handler } from "@elizaos/core";
import { BORROW_TEMPLATE } from "../lib/templates";
import { InputParserService } from "../services/input-parser";
import { BorrowService } from "../services/borrow";
import { WalletService } from "../services/wallet";
import type { FraxLendActionParams } from "../types";
import { formatWeiToNumber } from "../lib/format-number";
import dedent from "dedent";

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
	(opts) => async (runtime, message, state, _options, callback) => {
		const inputParser = new InputParserService();
		const { pairAddress, borrowAmount, collateralAmount, receiver } =
			await inputParser.parseInputs({
				runtime,
				message,
				state,
				template: BORROW_TEMPLATE,
			});

		try {
			const walletService = new WalletService(
				opts.walletPrivateKey,
				opts.chain,
			);
			const borrowService = new BorrowService(walletService);

			const result = await borrowService.execute({
				pairAddress,
				borrowAmount: BigInt(borrowAmount),
				collateralAmount: BigInt(collateralAmount),
				receiver,
			});

			callback?.({
				text: dedent`
                    ✅ Borrowing Transaction Successful

                    💸 Borrow Amount: ${formatWeiToNumber(borrowAmount)} tokens
                    🔒 Collateral Amount: ${formatWeiToNumber(collateralAmount)} tokens
                    📬 Receiver: ${receiver}
                    🔗 Transaction: ${result.txHash}

                    Funds have been borrowed from the FraxLend pool.
                `,
			});
			return true;
		} catch (error) {
			callback?.({
				text: dedent`
                    ❌ Borrowing Transaction Failed

                    Error: ${error.message}

                    Please verify your inputs and try again.
                `,
			});
			return false;
		}
	};
