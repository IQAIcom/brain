import {
	AgentRuntime,
	type IDatabaseAdapter,
	type ICacheManager,
	ModelProviderName,
	defaultCharacter,
} from "@elizaos/core";
import { createAgentKitPlugin } from "@iqai/plugin-agentkit";
import type { AgentConfig } from "../types";

export async function createAgentRuntime(
	database: IDatabaseAdapter,
	cache: ICacheManager,
	config: AgentConfig = {},
) {
	const plugins = [...(config.plugins || [])];

	return new AgentRuntime({
		databaseAdapter: database,
		token: config.modelKey,
		modelProvider: config.modelProvider || ModelProviderName.OPENAI,
		plugins,
		character: {
			...defaultCharacter,
			...config.character,
		},
		cacheManager: cache,
		fetch: async (url: string, options: RequestInit) => {
			return fetch(url, options);
		},
		evaluators: [],
		providers: [],
		actions: [],
		services: [],
		managers: [],
	});
}
