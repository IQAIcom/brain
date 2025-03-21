import type { Action, Handler } from "@elizaos/core";
import dedent from "dedent";
import { LendingStatsService } from "../services/lending-stats";
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
				text: lendingStatsService.formatStats(stats),
			});
			return true;
		} catch (error) {
			callback?.({
				text: dedent`
					❌ Failed to Fetch Lending Statistics

					Error: ${error.message}

					Please try again later.
				`,
			});
			return false;
		}
	};
