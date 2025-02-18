import type { Action, Handler } from "@elizaos/core";
import { BammPoolsStatsService } from "../services/pool-stats";
import { WalletService } from "../services/wallet";
import type { BAMMActionParams } from "../types";
import dedent from "dedent";

export const getBammPoolStatsAction = (opts: BAMMActionParams): Action => {
	return {
		name: "BAMM_GET_POOL_STATS",
		description: "Get statistics for all BAMM pools",
		similes: [
			"VIEW_POOLS",
			"VIEW_BAMMS",
			"CHECK_POOLS",
			"GET_POOL_INFO",
			"VIEW_POOL_STATS",
			"SHOW_POOLS",
			"CHECK_APR",
			"VIEW_TVL",
		],
		validate: async () => true,
		handler: handler(opts),
		examples: [
			[
				{
					user: "user",
					content: {
						text: "bamm pools please",
					},
				},
			],
			[
				{
					user: "user",
					content: {
						text: "show me all bamm pools",
					},
				},
			],
			[
				{
					user: "user",
					content: {
						text: "fetch all bamms",
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
			const bammPoolsStatsService = new BammPoolsStatsService(walletService);
			const poolStats = await bammPoolsStatsService.getPoolsStats();

			callback?.({
				text: bammPoolsStatsService.formatPoolsStats(poolStats),
			});
			return true;
		} catch (error) {
			callback?.({
				text: dedent`
          ❌ Failed to Fetch BAMM Pool Stats

          Error: ${error.message}

          Please try again later.
        `,
			});
			return false;
		}
	};
