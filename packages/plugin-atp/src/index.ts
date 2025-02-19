import { getAgentStatsAction } from "./actions/agent-stats";
import { getAgentPositionsAction } from "./actions/agent-positions";
import type { ATPActionParams } from "./types";
import type { Plugin } from "@elizaos/core";
import { getBuyAction } from "./actions/buy";
import { getSellAction } from "./actions/sell";
import { getAgentsAction } from "./actions/get-agents";

export async function createATPPlugin(opts: ATPActionParams): Promise<Plugin> {
	const actions = [
		getAgentsAction(opts),
		getAgentPositionsAction(opts),
		getBuyAction(opts),
		getSellAction(opts),
		getAgentStatsAction(opts),
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

export default createATPPlugin;
