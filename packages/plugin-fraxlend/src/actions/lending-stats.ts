import type { Action, Handler } from "@elizaos/core";
import { LendingStatsService } from "../services/lendingStats";
import type { FraxLendActionParams } from "../types";

export const getLendingStatsAction = (opts: FraxLendActionParams): Action => {
	return {
		name: "FRAXLEND_GET_STATS",
		description: "Get lending statistics from FraxLend pools",
		similes: [
			"GET_STATS",
			"VIEW_LENDING_STATS",
			"SHOW_POOL_INFO",
			"CHECK_APR",
			"VIEW_RATES",
			"GET_POOL_DATA",
			"CHECK_UTILIZATION",
			"VIEW_SUPPLY",
		],
		validate: async () => true,
		handler: handler(opts),
		examples: [],
	};
};

const handler: (opts: FraxLendActionParams) => Handler =
	() => async (_runtime, _message, _state, _options, callback) => {
		try {
			const lendingStatsService = new LendingStatsService();
			const stats = await lendingStatsService.getStats();

			callback?.({
				text: "Current lending statistics:",
				content: stats,
			});
			return true;
		} catch (error) {
			callback?.({
				text: `Error fetching lending stats: ${error.message}`,
				content: { error: error.message },
			});
			return false;
		}
	};
