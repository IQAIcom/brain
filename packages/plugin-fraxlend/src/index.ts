import type { Plugin } from "@elizaos/core";
import { getLendingStats } from "./actions/getLendingStats";
import { getUserPositions } from "./actions/getUserPositions";
import { deposit } from "./actions/deposit";
import { withdraw } from "./actions/withdraw";
import { lend } from "./actions/lend";

export interface FraxlendConfig {
	networkId: string;
	graphqlEndpoint: string;
}

export async function createFraxlendPlugin() {
	const actions = {
		getLendingStats,
		getUserPositions,
		deposit,
		withdraw,
		lend,
	};

	return {
		name: "Fraxlend Integration",
		description: "Fraxlend integration plugin for lending operations",
		providers: [],
		evaluators: [],
		services: [],
		actions,
	};
}

export default createFraxlendPlugin;
