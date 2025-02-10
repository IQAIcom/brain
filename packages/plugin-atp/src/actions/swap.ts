import type { Action, Handler } from "@elizaos/core";
import { SWAP_TEMPLATE } from "../lib/templates";
import { InputParserService } from "../services/input-parser";
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
	(opts) => async (_runtime, _message, _state, _options, callback) => {
		callback?.({
			text: dedent`
				❌ not implemented
				${opts}
			`,
		});
		return false;
	};
