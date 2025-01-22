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

	if (config.cdpConfig) {
		const agentKitPlugin = await createAgentKitPlugin({
			networkId: config.cdpConfig.networkId,
			cdpApiKeyName: config.cdpConfig.apiKeyName,
			cdpApiKeyPrivateKey: config.cdpConfig.apiKeyPrivateKey,
		});
		plugins.push(agentKitPlugin);
	}

	return new AgentRuntime({
		databaseAdapter: database,
		token: config.openAiKey || process.env.OPENAI_API_KEY || "test",
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
