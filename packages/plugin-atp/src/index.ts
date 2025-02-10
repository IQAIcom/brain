import { getAgentsStatsAction } from "./actions/agents-stats";
import { getAgentPositionsAction } from "./actions/agent-positions";
import { getSwapAction } from "./actions/swap";
import type { ATPActionParams } from "./types";
import type { Plugin } from "@elizaos/core";

export async function createATPPlugin(
	opts: ATPActionParams,
): Promise<Plugin> {
	const actions = [
		getAgentsStatsAction(opts),
		getAgentPositionsAction(opts),
		getSwapAction(opts),
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
