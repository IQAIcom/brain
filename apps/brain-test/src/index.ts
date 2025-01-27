import { setupAgent } from "@iqai/agent";
import { createFraxlendPlugin } from "@iqai/plugin-fraxlend";
import { bootstrapPlugin } from "@elizaos/plugin-bootstrap";
import { CacheStore, ModelProviderName } from "@elizaos/core";
import { fraxtal } from "viem/chains";

async function main() {
	const agentKitPlugin = await createFraxlendPlugin({
		chain: fraxtal,
		walletPrivateKey: process.env.WALLET_PRIVATE_KEY,
	});

	await setupAgent({
		modelProvider: ModelProviderName.OPENAI,
		modelKey: process.env.OPENAI_API_KEY,
		plugins: [bootstrapPlugin, agentKitPlugin],
		character: {
			bio: "I am a specialized AI assistant",
			style: {
				all: ["professional", "concise"],
				chat: ["friendly"],
				post: ["formal"],
			},
		},
		clients: {
			direct: {
				enabled: true,
				port: 3000,
			},
			telegram: {
				token: process.env.TELEGRAM_BOT_TOKEN,
			},
			twitter: {
				username: process.env.TWITTER_USERNAME,
				password: process.env.TWITTER_PASSWORD,
			},
		},
		databasePath: "./data",
		cacheStore: CacheStore.DATABASE,
	});
}

main().catch(console.error);
