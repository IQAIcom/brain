import { Agent } from "@iqai/agent";
import { createFraxlendPlugin } from "@iqai/plugin-fraxlend";
import { createOdosPlugin } from "@iqai/plugin-odos";
import { bootstrapPlugin } from "@elizaos/plugin-bootstrap";
import { CacheStore, ModelProviderName } from "@elizaos/core";
import { fraxtal } from "viem/chains";
import createHeartbeatPlugin from "@iqai/plugin-heartbeat";

async function main() {
	const fraxlendPlugin = await createFraxlendPlugin({
		chain: fraxtal,
		walletPrivateKey: process.env.WALLET_PRIVATE_KEY,
	});

	const odosPlugin = await createOdosPlugin({
		chain: fraxtal,
		walletPrivateKey: process.env.WALLET_PRIVATE_KEY,
	});

	const heartbeatPlugin = await createHeartbeatPlugin([
		{
			period: "*/30 * * * * *",
			input:
				"Post a intreating joke about crypto. it should be positive to crypto community. Start with Hello Telegram 👋",
			client: "telegram",
			config: {
				chatId: "-2361588545",
			},
		},
		{
			period: "*/30 * * * * *",
			input:
				"Post a intreating joke about crypto. it should be positive to crypto community. Start with Hey Twitter 👋",
			client: "twitter",
		},
	]);

	const agent = new Agent({
		modelProvider: ModelProviderName.OPENAI,
		modelKey: process.env.OPENAI_API_KEY,
		plugins: [bootstrapPlugin, fraxlendPlugin, odosPlugin, heartbeatPlugin],
		character: {
			name: "BrainBot",
			bio: "You are BrainBot, a helpful assistant.",
			username: "brainbot",
			messageExamples: [],
			lore: [],
			style: {
				all: [],
				chat: [],
				post: [],
			},
		},
		clientConfig: {
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

	await agent.start();
}

main().catch(console.error);
