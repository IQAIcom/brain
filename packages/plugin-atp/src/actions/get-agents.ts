import type { Action, Handler } from "@elizaos/core";
import { GetAgentsService } from "../services/get-agents";
import { InputParserService } from "../services/input-parser";
import type { ATPActionParams } from "../types";
import { GET_AGENTS_TEMPLATE } from "../lib/templates";
import { elizaLogger } from "@elizaos/core";

export const getAgentsAction = (opts: ATPActionParams): Action => {
	return {
		name: "ATP_GET_AGENTS",
		description: "Get a list of AI agents on ATP",
		similes: [
			"LIST_AGENTS",
			"SHOW_AGENTS",
			"TOP_AGENTS",
			"VIEW_AGENTS",
			"GET_AGENTS",
			"DISPLAY_AGENTS",
		],
		validate: async () => true,
		handler: handler(opts),
		examples: [],
	};
};

const handler: (opts: ATPActionParams) => Handler =
	(_opts) => async (runtime, message, state, _options, callback) => {
		elizaLogger.info("🔍 Fetching agents list");
		try {
			const inputParser = new InputParserService();
			const {
				sort = null,
				limit = null,
				error,
			} = await inputParser.parseInputs({
				runtime,
				message,
				state,
				template: GET_AGENTS_TEMPLATE,
			});
			elizaLogger.info(
				`
				Get agents params:
					sort: ${sort}
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

			const tokensService = new GetAgentsService();
			const agents = await tokensService.getAgents({ sort, limit });

			const formattedAgents = tokensService.formatAgents(agents);
			callback?.({
				text: formattedAgents,
			});
			elizaLogger.info("✅ Agents fetched successfully");
			return true;
		} catch (error) {
			elizaLogger.error("❌ Agents fetch failed", { error });
			callback?.({
				text: `❌ Error: ${error.message}`,
			});
			return false;
		}
	};
