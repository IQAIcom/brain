import {
	type IAgentRuntime,
	type Memory,
	type Provider,
	type State,
	elizaLogger,
} from "@elizaos/core";
import { CHAIN_IDS } from "../lib/constants";

const chainIdProvider: Provider = {
	get: async (_runtime: IAgentRuntime, _message: Memory, _state?: State) => {
		elizaLogger.debug("ChainId provider get called");
		const chains = Object.entries(CHAIN_IDS)
			.map(([chainName, chainId]) => `${chainName}: ${chainId}`)
			.join("\n");
		return `The available chains and their IDs are:\n${chains}`;
	},
};

export { chainIdProvider };
