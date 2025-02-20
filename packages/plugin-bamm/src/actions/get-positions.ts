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
		examples: [
			[
				{
					user: "user",
					content: {
						text: "my bamm positions please",
					},
				},
				{
					user: "system",
					content: {
						text: `
							📊 *Your Active BAMM Positions*

							**💰 BAMM Position**
							- bamm: 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84
							- Pair: 0xb4262A3619745c93Aa29C1E7FB227927647778d6
							- IQT: 95.96K
							- CABU: 26.12K
							- rented: 5.00K
						`,
					},
				},
			],
		],
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
