import type { Action, Handler } from "@elizaos/core";
import { SWAP_TEMPLATE } from "../lib/templates";
import { InputParserService } from "../services/input-parser";
import { LendService } from "../services/swap";
import { WalletService } from "../services/wallet";
import type { ATPActionParams } from "../types";
import { formatWeiToNumber } from "../lib/format-number";
import dedent from "dedent";

export const getSwapAction = (opts: ATPActionParams): Action => {
	return {
		name: "ATP_SWAP",
		description: "swap ai tokens on IQ ATP",
		similes: [
			"SWAP_AI_TOKENS",
			"SWAP_ATP_AI_TOKENS",
			"SWAP_ATP_AI_TOKENS",
			"BUY_ATP_AI_TOKENS",
			"SELL_ATP_AI_TOKENS",
		],
		validate: async () => true,
		handler: handler(opts),
		examples: [],
	};
};

const handler: (opts: ATPActionParams) => Handler =
	(opts) => async (runtime, message, state, _options, callback) => {
		const inputParser = new InputParserService();
		const { pairAddress, amount } = await inputParser.parseInputs({
			runtime,
			message,
			state,
			template: SWAP_TEMPLATE,
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
					✅ Swap Transaction Successful

					💰 Amount: ${formatWeiToNumber(amount)} tokens
					🔗 Transaction: ${result.txHash}

					Your assets have been successfully supplied to IQ ATP.
				`,
			});
			return true;
		} catch (error) {
			callback?.({
				text: dedent`
					❌ Swap Transaction Failed

					Error: ${error.message}

					Please verify your inputs and try again.
				`,
			});
			return false;
		}
	};
