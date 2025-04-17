import type { Plugin } from "@elizaos/core";
import { getAgentPositionsAction } from "./actions/agent-positions";
import { getAgentStatsAction } from "./actions/agent-stats";
import { getBuyAction } from "./actions/buy";
import { getAgentsAction } from "./actions/get-agents";
import { getSellAction } from "./actions/sell";
import { getAgentLogsAction } from "./actions/get-agent-logs";
import { addAgentLogAction } from "./actions/add-agent-log";
import type { ATPActionParams } from "./types";

export async function createAtpPlugin(opts: ATPActionParams): Promise<Plugin> {
	const actions = [
		getAgentsAction(opts),
		getAgentPositionsAction(opts),
		getBuyAction(opts),
		getSellAction(opts),
		getAgentStatsAction(opts),
		getAgentLogsAction(opts),
		addAgentLogAction(opts),
	];

	return {
		name: "ATP Integration",
		description: "ATP integration plugin for interacting with AITokens",
		providers: [],
		evaluators: [],
		services: [],
		actions,
	};
}

export default createAtpPlugin;
