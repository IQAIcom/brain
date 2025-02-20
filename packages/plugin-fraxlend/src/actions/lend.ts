import { type Action, type Handler, elizaLogger } from "@elizaos/core";
import dedent from "dedent";
import { formatWeiToNumber } from "../lib/format-number";
import { LEND_TEMPLATE } from "../lib/templates";
import { InputParserService } from "../services/input-parser";
import { LendService } from "../services/lend";
import { WalletService } from "../services/wallet";
import type { FraxLendActionParams } from "../types";

export const getLendAction = (opts: FraxLendActionParams): Action => {
	return {
		name: "FRAXLEND_LEND",
		description: "Lend assets to a FraxLend pool",
		similes: [
			"LEND",
			"SUPPLY",
			"PROVIDE_ASSETS",
			"LOAN_ASSETS",
			"SUPPLY_TOKENS",
			"LEND_TOKENS",
		],
		validate: async () => true,
		handler: handler(opts),
		examples: [],
	};
};

const handler: (opts: FraxLendActionParams) => Handler =
	(opts) => async (runtime, message, state, _options, callback) => {
		elizaLogger.info("💬 Recent Messages", state.recentMessages);

		const inputParser = new InputParserService();
		const { pairAddress, amount } = await inputParser.parseInputs({
			runtime,
			message,
			state,
			template: LEND_TEMPLATE,
		});

		console.log("ℹ️ Executing Lend Action with params:", {
			pairAddress,
			amount,
		});

		try {
			const walletService = new WalletService(
				opts.walletPrivateKey,
				opts.chain,
			);
			const lendService = new LendService(walletService);

			const result = await lendService.execute({
				pairAddress,
				amount: BigInt(amount),
			});

			callback?.({
				text: dedent`
					✅ Lending Transaction Successful

					💰 Amount: ${formatWeiToNumber(amount)} tokens
					🔗 Transaction: ${result.txHash}

					Your assets have been successfully supplied to the FraxLend pool.
				`,
			});
			return true;
		} catch (error) {
			callback?.({
				text: dedent`
					❌ Lending Transaction Failed

					Error: ${error.message}

					Please verify your inputs and try again.
				`,
			});
			return false;
		}
	};
