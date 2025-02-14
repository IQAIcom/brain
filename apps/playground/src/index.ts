import { SqliteDatabaseAdapter } from "@elizaos/adapter-sqlite";
import DirectClientInterface from "@elizaos/client-direct";
import { ModelProviderName } from "@elizaos/core";
import { AgentBuilder } from "@iqai/agent";
import { createATPPlugin } from "@iqai/plugin-atp";
import { createFraxlendPlugin } from "@iqai/plugin-fraxlend";
import { createOdosPlugin } from "@iqai/plugin-odos";
import createSequencerPlugin from "@iqai/plugin-sequencer";
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
	const sequencerPlugin = await createSequencerPlugin();

	// Setup database
	const dataDir = path.join(process.cwd(), "./data");
	fs.mkdirSync(dataDir, { recursive: true });
	const dbPath = path.join(dataDir, "db.sqlite");
	const databaseAdapter = new SqliteDatabaseAdapter(new Database(dbPath));

	// Build agent using builder pattern
	const agent = new AgentBuilder()
		.withDatabase(databaseAdapter)
		.withClient("direct", DirectClientInterface)
		.withModelProvider(
			ModelProviderName.OPENAI,
			process.env.OPENAI_API_KEY as string,
		)
		.withPlugins([fraxlendPlugin, odosPlugin, atpPlugin, sequencerPlugin])
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
