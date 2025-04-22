import type { Action, Handler } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import { GET_AGENT_LOGS_TEMPLATE } from "../lib/templates";
import { AgentLogsService } from "../services/agent-logs";
import { InputParserService } from "../services/input-parser";
import type { ATPActionParams } from "../types";

export const getAgentLogsAction = (opts: ATPActionParams): Action => {
	return {
		name: "ATP_GET_AGENT_LOGS",
		description: "Get logs for an AI agent on ATP",
		similes: [
			"VIEW_AGENT_LOGS",
			"SHOW_AGENT_LOGS",
			"DISPLAY_AGENT_LOGS",
			"GET_LOGS",
			"LIST_AGENT_LOGS",
			"FETCH_AGENT_LOGS",
		],
		validate: async () => true,
		handler: handler(opts),
		examples: [],
	};
};

const handler: (opts: ATPActionParams) => Handler =
	(_opts) => async (runtime, message, state, _options, callback) => {
		elizaLogger.info("🔍 Fetching agent logs");
		try {
			const inputParser = new InputParserService();
			const {
				agentTokenContract = null,
				page,
				limit,
				error,
			} = await inputParser.parseInputs({
				runtime,
				message,
				state,
				template: GET_AGENT_LOGS_TEMPLATE,
			});
			elizaLogger.info(
				`
        Get agent logs params:
          agentTokenContract: ${agentTokenContract}
          page: ${page}
          limit: ${limit}
          error: ${error}
        `,
			);

			if (error) {
				callback?.({
					text: `❌ Error: ${error}`,
				});
				return false;
			}

			if (!agentTokenContract) {
				callback?.({
					text: "❌ Agent token contract address is required",
				});
				return false;
			}

			const logsService = new AgentLogsService();
			const logsResponse = await logsService.getLogs({
				agentTokenContract,
				page,
				limit,
			});

			const formattedLogs = logsService.formatLogs(logsResponse);
			callback?.({
				text: formattedLogs,
			});
			elizaLogger.info("✅ Agent logs fetched successfully");
			return true;
		} catch (error) {
			elizaLogger.error("❌ Agent logs fetch failed", { error });
			callback?.({
				text: `❌ Error: ${error.message}`,
			});
			return false;
		}
	};
