import * as fs from "node:fs";
import * as path from "node:path";
import { SqliteDatabaseAdapter } from "@elizaos/adapter-sqlite";
import DirectClientInterface from "@elizaos/client-direct";
import TelegramClientInterface from "@elizaos/client-telegram";
import { AgentBuilder, ModelProviderName } from "@iqai/agent";
import { createAtpPlugin } from "@iqai/plugin-atp";
import { createJsPlugin } from "@iqai/plugin-js";
import { createFraxlendPlugin } from "@iqai/plugin-fraxlend";
import createHeartbeatPlugin from "@iqai/plugin-heartbeat";
import { createOdosPlugin } from "@iqai/plugin-odos";
import { createWalletPlugin } from "@iqai/plugin-wallet";
import createSequencerPlugin from "@iqai/plugin-sequencer";
import { createMcpPlugin } from "@iqai/plugin-mcp";
import Database from "better-sqlite3";
import { fraxtal } from "viem/chains";
import createBAMMPlugin from "@iqai/plugin-bamm";

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

	const atpPlugin = await createAtpPlugin({
		walletPrivateKey: process.env.WALLET_PRIVATE_KEY,
	});

	const sequencerPlugin = await createSequencerPlugin();

	const walletPlugin = await createWalletPlugin({
		covalentApiKey: process.env.COVALENT_API_KEY,
		walletAddress: process.env.WALLET_ADDRESS,
	});

	const jsPlugin = await createJsPlugin();
	const bammPlugin = await createBAMMPlugin({
		walletPrivateKey: process.env.WALLET_PRIVATE_KEY,
	});
	const mcpPlugin = await createMcpPlugin({
		mode: "sse",
		serverUrl: "http://localhost:6969/sse",
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
		.withClient("telegram", TelegramClientInterface)
		.withModelProvider(
			ModelProviderName.OPENAI,
			process.env.OPENAI_API_KEY as string,
		)
		.withPlugins([
			fraxlendPlugin,
			odosPlugin,
			atpPlugin,
			sequencerPlugin,
			walletPlugin,
			jsPlugin,
			mcpPlugin,
			bammPlugin,
		])
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
