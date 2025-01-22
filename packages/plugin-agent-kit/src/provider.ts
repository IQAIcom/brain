import type { Provider, IAgentRuntime } from "@elizaos/core";
import { CdpAgentkit } from "@coinbase/cdp-agentkit-core";
import * as fs from "node:fs";
import type { AgentKitConfig } from "./types.ts";

export function createClient(config: AgentKitConfig) {
    return async (): Promise<CdpAgentkit> => {
        const walletDataPath = config.walletDataPath || "wallet_data.txt";
        let walletDataStr: string | null = null;

        if (fs.existsSync(walletDataPath)) {
            try {
                walletDataStr = fs.readFileSync(walletDataPath, "utf8");
                console.log("💾 Loaded existing wallet data successfully");
            } catch (error) {
                console.error("❌ Error reading wallet data:", error);
            }
        } else {
            console.log("🆕 No existing wallet found - creating new wallet");
        }

        const agentKitConfig = {
            cdpWalletData: walletDataStr || undefined,
            networkId: config.networkId || "base-sepolia",
            cdpApiKeyName: config.cdpApiKeyName || "default",
            cdpApiKeyPrivateKey: config.cdpApiKeyPrivateKey || "",
        };

        console.log(`🌐 Configuring AgentKit for network: ${agentKitConfig.networkId}`);
        const agentkit = await CdpAgentkit.configureWithWallet(agentKitConfig);
        const exportedWallet = await agentkit.exportWallet();
        fs.writeFileSync(walletDataPath, exportedWallet);
        console.log("💼 Wallet data saved successfully");
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
                console.log(`🔑 Wallet initialized successfully`);
                console.log(`📍 Wallet address: ${address}`);
                return `🏦 AgentKit Wallet Address: ${address}`;
            } catch (error) {
                console.error("💥 Error in AgentKit provider:", error);
                return null;
            }
        },
    };
}
