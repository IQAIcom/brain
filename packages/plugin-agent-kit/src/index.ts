import { type Plugin, elizaLogger } from "@elizaos/core";
import { getAgentKitActions } from "./actions.ts";
import { createClient, createWalletProvider } from "./provider.ts";
import type { AgentKitConfig } from "./types.ts";

export async function createAgentKitPlugin(
	config: AgentKitConfig,
): Promise<Plugin> {
	const getClient = createClient(config);
	const walletProvider = createWalletProvider(config);

	const initializeActions = async () => {
		try {
			const actions = await getAgentKitActions({
				getClient,
				config: {
					networkId: config.networkId,
				},
			});
			elizaLogger.info("✅ AgentKit actions initialized successfully.");
			return actions;
		} catch (error) {
			elizaLogger.error("❌ Failed to initialize AgentKit actions:", error);
			return null;
		}
	};

	return {
		name: "AgentKit Integration",
		description: "AgentKit integration plugin",
		providers: [walletProvider],
		evaluators: [],
		services: [],
		actions: (await initializeActions()) ?? undefined,
	};
}

export default createAgentKitPlugin;
