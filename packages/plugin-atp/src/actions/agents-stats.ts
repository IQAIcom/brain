import type { Action, Handler } from "@elizaos/core";
import { AgentsStatsService } from "../services/agents-stats";
import type { ATPActionParams } from "../types";
import dedent from "dedent";

export const getAgentsStatsAction = (opts: ATPActionParams): Action => {
	return {
		name: "ATP_AGENT_STATS",
		description: "Get stats from agents on IQ ATP",
		similes: [
			"AGENT_STATS",
			"VIEW_AGENTS_STATS",
			"CHECK_AGENTS_STATS",
			"GET_AGENTS_STATS",
			"SHOW_AGENTS_STATS",
			"CHECK_AGENTS_STATS",
			"GET_AGENTS_STATS",
			"SHOW_AGENTS_STATS",
		],
		validate: async () => true,
		handler: handler(opts),
		examples: [],
	};
};

const handler: (opts: ATPActionParams) => Handler =
	() => async (_runtime, _message, _state, _options, callback) => {
		try {
			const service = new AgentsStatsService();
			const stats = await service.getStats();

			callback?.({
				text: service.formatStats(stats),
			});
			return true;
		} catch (error) {
			callback?.({
				text: dedent`
					❌ Failed to Fetch Agents Statistics

					Error: ${error.message}

					Please try again later.
				`,
			});
			return false;
		}
	};
