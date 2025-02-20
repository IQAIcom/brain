import * as fs from "node:fs";
import { CdpAgentkit } from "@coinbase/cdp-agentkit-core";
import { type IAgentRuntime, type Provider, elizaLogger } from "@elizaos/core";
import type { AgentKitConfig } from "./types.ts";

export function createClient(config: AgentKitConfig) {
	return async (): Promise<CdpAgentkit> => {
		const walletDataPath = config.walletDataPath || "wallet_data.txt";
		let walletDataStr: string | null = null;

		if (fs.existsSync(walletDataPath)) {
			try {
				walletDataStr = fs.readFileSync(walletDataPath, "utf8");
				elizaLogger.info("💾 Loaded existing wallet data successfully");
			} catch (error) {
				elizaLogger.error("❌ Error reading wallet data:", error);
			}
		} else {
			elizaLogger.info("🆕 No existing wallet found - creating new wallet");
		}

		const agentKitConfig = {
			cdpWalletData: walletDataStr || undefined,
			networkId: config.networkId || "base-sepolia",
			cdpApiKeyName: config.cdpApiKeyName || "default",
			cdpApiKeyPrivateKey: config.cdpApiKeyPrivateKey || "",
		};

		elizaLogger.info(
			`🌐 Configuring AgentKit for network: ${agentKitConfig.networkId}`,
		);
		const agentkit = await CdpAgentkit.configureWithWallet(agentKitConfig);
		const exportedWallet = await agentkit.exportWallet();
		fs.writeFileSync(walletDataPath, exportedWallet);
		elizaLogger.info("💼 Wallet data saved successfully");
		return agentkit;
	};
}

export function createWalletProvider(config: AgentKitConfig): Provider {
	const getClient = createClient(config);

	return {
		async get(_runtime: IAgentRuntime): Promise<string | null> {
			try {
				const client = await getClient();
				const address = (await (client as any).wallet.addresses)[0].id;
				elizaLogger.info("🔑 Wallet initialized successfully");
				elizaLogger.info(`📍 Wallet address: ${address}`);
				return `🏦 AgentKit Wallet Address: ${address}`;
			} catch (error) {
				elizaLogger.error("💥 Error in AgentKit provider:", error);
				return null;
			}
		},
	};
}
