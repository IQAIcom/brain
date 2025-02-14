import { SqliteDatabaseAdapter } from "@elizaos/adapter-sqlite";
import DirectClientInterface from "@elizaos/client-direct";
import { TelegramClientInterface } from "@elizaos/client-telegram";
import { TwitterClientInterface } from "@elizaos/client-twitter";
import { ModelProviderName, type HandlerCallback } from "@elizaos/core";
import { bootstrapPlugin } from "@elizaos/plugin-bootstrap";
import { AgentBuilder, createSimplePlugin } from "@iqai/agent";
import { createFraxlendPlugin } from "@iqai/plugin-fraxlend";
import createHeartbeatPlugin from "@iqai/plugin-heartbeat";
import { createOdosPlugin } from "@iqai/plugin-odos";
import { createATPPlugin } from "@iqai/plugin-atp";
import Database from "better-sqlite3";
import * as fs from "node:fs";
import * as path from "node:path";
import { fraxtal } from "viem/chains";

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
		// 	period: "*/10 * * * * *",
		// 	input: "Post a intreating joke about crypto. it should be positive to crypto community. Start with Hello Telegram 👋",
		// 	client: "telegram",
		// 	config: {
		// 		chatId: "-2367076587",
		// 	},
		// },
		// {
		// 	period: "*/30 * * * * *",
		// 	input:
		// 		"Post a intreating joke about crypto. it should be positive to crypto community. Start with Hey Twitter 👋",
		// 	client: "twitter",
		// },
	]);

	const timePlugin = createSimplePlugin({
		name: "time-plugin",
		description: "Provides current time and timezone information",
		actions: [
			{
				name: "TELL_TIME",
				description: "Returns the current time in different formats",
				handler: async (opts) => {
					const now = new Date();
					const localTime = now.toLocaleTimeString();
					const utcTime = now.toUTCString();

					opts.callback?.({
						text: `🕒 Current time:\nLocal: ${localTime}\nUTC: ${utcTime}`
					});
					return true;
				}
			},
			{
				name: "timezone",
				description: "Returns the current timezone information",
				handler: async (opts) => {
					const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

					opts.callback?.({
						text: `🌍 Your timezone is: ${timezone}`
					});
					return true;
				}
			}
		]
	});


	// Setup database
	const dataDir = path.join(process.cwd(), "./data");
	fs.mkdirSync(dataDir, { recursive: true });
	const dbPath = path.join(dataDir, "db.sqlite");
	const databaseAdapter = new SqliteDatabaseAdapter(new Database(dbPath));

	// Build agent using builder pattern
	const agent = new AgentBuilder()
		.withDatabase(databaseAdapter)
		.withClient("direct", DirectClientInterface)
		.withClient("twitter", TwitterClientInterface)
		.withClient("telegram", TelegramClientInterface)
		.withModelProvider(
			ModelProviderName.OPENAI,
			process.env.OPENAI_API_KEY as string,
		)
		.withPlugin(bootstrapPlugin)
		.withPlugin(timePlugin)
		.withPlugin(fraxlendPlugin)
		.withPlugin(odosPlugin)
		.withPlugin(heartbeatPlugin)
		.withPlugin(atpPlugin)
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
