import type { Action, Handler } from "@elizaos/core";
import { AgentsStatsService } from "../services/agents-stats";
import { InputParserService } from "../services/input-parser";
import type { ATPActionParams } from "../types";
import { GET_AGENT_STATS_TEMPLATE } from "../lib/templates";

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
  (_opts) => async (runtime, message, state, _options, callback) => {
    try {
      const inputParser = new InputParserService();
      const { agentAddress } = await inputParser.parseInputs({
        runtime,
        message,
        state,
        template: GET_AGENT_STATS_TEMPLATE,
      });

      const statsService = new AgentsStatsService();
      const stats = await statsService.getStats(agentAddress);
      const formattedStats = statsService.formatStats(stats);

      callback?.({
        text: formattedStats,
      });
      return true;
    } catch (error) {
      callback?.({
        text: `❌ Error: ${error.message}`,
      });
      return false;
    }
  };
