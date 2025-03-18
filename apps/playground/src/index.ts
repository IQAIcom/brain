import * as fs from "node:fs";
import * as path from "node:path";
import { SqliteDatabaseAdapter } from "@elizaos/adapter-sqlite";
import DirectClientInterface from "@elizaos/client-direct";
import { AgentBuilder, ModelProviderName } from "@iqai/agent";
import Database from "better-sqlite3";
import createWikiPlugin from "@iqai/plugin-wiki";

async function main() {
	// Initialize plugins
	const wikiPlugin = await createWikiPlugin();

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
		.withPlugins([wikiPlugin])
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
