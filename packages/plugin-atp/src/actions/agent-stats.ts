import type { Action, Handler } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import { GET_AGENT_STATS_TEMPLATE } from "../lib/templates";
import { AgentStatsService } from "../services/agent-stats";
import { InputParserService } from "../services/input-parser";
import type { ATPActionParams } from "../types";

export const getAgentStatsAction = (opts: ATPActionParams): Action => {
	return {
		name: "ATP_AGENT_STATS",
		description: "Get stats/details of given agent on ATP",
		similes: [
			"AGENT_STATS",
			"AGENT_DETAILS",
			"VIEW_AGENT_STATS",
			"VIEW_AGENT_DETAILS",
			"CHECK_AGENT_STATS",
			"GET_AGENT_STATS",
			"GET_AGENT_DETAILS",
			"SHOW_AGENT_STATS",
			"SHOW_AGENT_DETAILS",
			"CHECK_AGENT_STATS",
			"GET_AGENT_DETAILS",
			"GET_AGENT_STATS",
			"SHOW_AGENT_DETAILS",
			"SHOW_AGENT_STATS",
		],
		validate: async () => true,
		handler: handler(opts),
		examples: [],
	};
};

const handler: (opts: ATPActionParams) => Handler =
	(_opts) => async (runtime, message, state, _options, callback) => {
		elizaLogger.info("🔍 Fetching agent stats");
		try {
			const inputParser = new InputParserService();
			const { tokenContract, error } = await inputParser.parseInputs({
				runtime,
				message,
				state,
				template: GET_AGENT_STATS_TEMPLATE,
			});

			if (error) {
				callback?.({
					text: `❌ Error: ${error}`,
				});
				return false;
			}

			const statsService = new AgentStatsService();
			const stats = await statsService.getStats(tokenContract);

			const formattedStats = statsService.formatStats(stats);
			callback?.({
				text: formattedStats,
			});
			return true;
		} catch (error) {
			elizaLogger.error("❌ Stats fetch failed", { error });
			callback?.({
				text: `❌ Error: ${error.message}`,
			});
			return false;
		}
	};
