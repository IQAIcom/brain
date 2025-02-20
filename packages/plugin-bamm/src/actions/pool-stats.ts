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
						text: "show me all bamm pools",
					},
				},
				{
					user: "system",
					content: {
						text: `
							📊 *BAMM Pool Stats:*
							Total: 35

							📊 Pool: FRAX/FXS
							- Pool Address: 0xb4dA8dA10ffF1F6127ab71395053Aa1d499b503F
							- BAMM Address: 0x659e0A9306144adE61c483A775e881356bcb9AEB
							- TVL: $3.90M
							- FRAX Locked: 1.96M
							- FXS Locked: 1.11M

							📊 Pool: FRAX/wfrxETH
							- Pool Address: 0x4527bcEd9d41706D1436507e9a6e354d3FF44ff9
							- BAMM Address: 0xBA082D3ef4d27d31c49f05dd8F096A236c0f7069
							- TVL: $2.89M
							- FRAX Locked: 1.45M
							- wfrxETH Locked: 537.87

							📊 Pool: FXS/wfrxETH
							- Pool Address: 0x922Aa688F879050b2e32a63D764cf4E8B79c3Bdb
							- BAMM Address: 0x3eA5cb029769a0fD0d1C51c16Fb6d64865312207
							- TVL: $149.08K
							- FXS Locked: 42.68K
							- wfrxETH Locked: 33.02
						  .....
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
