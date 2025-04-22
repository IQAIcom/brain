import type { Action, Handler } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import { ADD_AGENT_LOG_TEMPLATE } from "../lib/templates";
import { AgentLogsService } from "../services/agent-logs";
import { InputParserService } from "../services/input-parser";
import type { ATPActionParams } from "../types";

export const addAgentLogAction = (opts: ATPActionParams): Action => {
	return {
		name: "ATP_ADD_AGENT_LOG",
		description: "Add a new log entry for an AI agent on ATP",
		similes: [
			"CREATE_AGENT_LOG",
			"LOG_AGENT_MESSAGE",
			"ADD_LOG",
			"RECORD_AGENT_LOG",
			"SAVE_AGENT_LOG",
			"POST_AGENT_LOG",
		],
		validate: async () => true,
		handler: handler(opts),
		examples: [],
	};
};

const handler: (opts: ATPActionParams) => Handler =
	(opts) => async (runtime, message, state, _options, callback) => {
		elizaLogger.info("📝 Adding agent log");
		try {
			if (!opts.apiKey) {
				callback?.({
					text: "❌ ATP API key is required for adding a new log",
				});
				return false;
			}
			const inputParser = new InputParserService();
			const {
				agentTokenContract = null,
				content = null,
				txHash,
				error,
			} = await inputParser.parseInputs({
				runtime,
				message,
				state,
				template: ADD_AGENT_LOG_TEMPLATE,
			});
			elizaLogger.info(
				`
        Add agent log params:
          agentTokenContract: ${agentTokenContract}
          content length: ${content ? content.length : 0}
          txHash: ${txHash}
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

			if (!content) {
				callback?.({
					text: "❌ Log content is required",
				});
				return false;
			}

			const logsService = new AgentLogsService();
			const logEntry = await logsService.addLog({
				agentTokenContract,
				content,
				apiKey: opts.apiKey,
				txHash,
			});

			callback?.({
				text: `✅ Log successfully added to agent ${agentTokenContract}`,
			});
			elizaLogger.info("✅ Agent log added successfully", {
				logId: logEntry.id,
			});
			return true;
		} catch (error) {
			elizaLogger.error("❌ Adding agent log failed", { error });
			callback?.({
				text: `❌ Error: ${error.message}`,
			});
			return false;
		}
	};
