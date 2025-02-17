import type { Action, Handler } from "@elizaos/core";
import { BammPositionsService } from "../services/get-positions";
import { WalletService } from "../services/wallet";
import type { BAMMActionParams } from "../types";
import dedent from "dedent";

export const getBammPositionsAction = (opts: BAMMActionParams): Action => {
	return {
		name: "BAMM_GET_POSITIONS",
		description: "Get your positions in BAMM pools",
		similes: [
			"VIEW_POSITIONS",
			"CHECK_BALANCE",
			"GET_HOLDINGS",
			"VIEW_PORTFOLIO",
			"CHECK_POSITIONS",
			"SHOW_ASSETS",
			"VIEW_INVESTMENTS",
		],
		validate: async () => true,
		handler: handler(opts),
		examples: [],
	};
};

const handler: (opts: BAMMActionParams) => Handler =
	(opts) => async (_runtime, _message, _state, _options, callback) => {
		try {
			const walletService = new WalletService(
				opts.walletPrivateKey,
				opts.chain,
			);
			const bammPositionsService = new BammPositionsService(walletService);
			const positions = await bammPositionsService.getPositions();

			callback?.({
				text: bammPositionsService.formatPositions(positions),
			});
			return true;
		} catch (error) {
			callback?.({
				text: dedent`
          ❌ Failed to Fetch BAMM Positions

          Error: ${error.message}

          Please try again later.
        `,
			});
			return false;
		}
	};
