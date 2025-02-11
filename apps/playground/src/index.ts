import { SqliteDatabaseAdapter } from "@elizaos/adapter-sqlite";
import DirectClientInterface from "@elizaos/client-direct";
import { TelegramClientInterface } from "@elizaos/client-telegram";
import { TwitterClientInterface } from "@elizaos/client-twitter";
import { ModelProviderName } from "@elizaos/core";
import { bootstrapPlugin } from "@elizaos/plugin-bootstrap";
import { AgentBuilder } from "@iqai/agent";
import { createFraxlendPlugin } from "@iqai/plugin-fraxlend";
import createHeartbeatPlugin from "@iqai/plugin-heartbeat";
import { createOdosPlugin } from "@iqai/plugin-odos";
import { createATPPlugin } from "@iqai/plugin-atp";
import Database from "better-sqlite3";
import * as fs from "node:fs";
import * as path from "node:path";
import { fraxtal } from "viem/chains";
import createSequencerPlugin from "@iqai/plugin-sequencer";

async function main() {
	// Initialize plugins
	const fraxlendPlugin = await createFraxlendPlugin({
		chain: fraxtal,
		walletPrivateKey: process.env.WALLET_PRIVATE_KEY,
	});

	const odosPlugin = await createOdosPlugin({
		chain: fraxtal,
		walletPrivateKey: process.env.WALLET_PRIVATE_KEY,
	});

	const atpPlugin = await createATPPlugin({
		walletPrivateKey: process.env.WALLET_PRIVATE_KEY,
	});

	const heartbeatPlugin = await createHeartbeatPlugin([
		// {
		// 	period: "*/30 * * * * *",
		// 	input:
		// 		"Post a intreating joke about crypto. it should be positive to crypto community. Start with Hello Telegram 👋",
		// 	client: "telegram",
		// 	config: {
		// 		chatId: "-2361588545",
		// 	},
		// },
		// {
		// 	period: "*/30 * * * * *",
		// 	input:
		// 		"Post a intreating joke about crypto. it should be positive to crypto community. Start with Hey Twitter 👋",
		// 	client: "twitter",
		// },
	]);

	const sequencerPlugin = await createSequencerPlugin();

	// Setup database
	const dataDir = path.join(process.cwd(), "./data");
	fs.mkdirSync(dataDir, { recursive: true });
	const dbPath = path.join(dataDir, "db.sqlite");
	const databaseAdapter = new SqliteDatabaseAdapter(new Database(dbPath));

	// Build agent using builder pattern
	const agent = new AgentBuilder()
		.withDatabase(databaseAdapter)
		.withClient("telegram", TelegramClientInterface)
		.withClient("twitter", TwitterClientInterface)
		.withClient("direct", DirectClientInterface)
		.withModelProvider(
			ModelProviderName.OPENAI,
			process.env.OPENAI_API_KEY as string,
		)
		.withPlugin(bootstrapPlugin)
		.withPlugin(fraxlendPlugin)
		.withPlugin(odosPlugin)
		.withPlugin(heartbeatPlugin)
		.withPlugin(atpPlugin)
		.withPlugin(sequencerPlugin)
		.withCharacter({
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
		})
		.build();

	await agent.start();
}

main().catch(console.error);
