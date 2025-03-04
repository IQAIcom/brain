import type { Plugin } from "@elizaos/core";
import type { NearAgentConfig } from "./types";
import { NearAgent } from "./services/near-agent";

export async function createNearPlugin(opts: NearAgentConfig): Promise<Plugin> {
	return {
		name: "Near Agent Integration",
		description:
			"Framework for creating AI agents that interact with NEAR smart contracts",
		providers: [],
		evaluators: [],
		services: [new NearAgent(opts)],
	};
}

export default createNearPlugin;
