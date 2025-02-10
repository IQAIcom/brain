import { getAgentsStatsAction } from "./actions/agents-stats";
import { getAgentPositionsAction } from "./actions/agent-positions";
import type { ATPActionParams } from "./types";
import type { Plugin } from "@elizaos/core";
import { getBuyAction } from "./actions/buy";
import { getSellAction } from "./actions/sell";

export async function createATPPlugin(
	opts: ATPActionParams,
): Promise<Plugin> {
	const actions = [
		getAgentsStatsAction(opts),
		getAgentPositionsAction(opts),
		getBuyAction(opts),
		getSellAction(opts),
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
