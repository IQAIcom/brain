import SqliteAdapter from "@elizaos/adapter-sqlite";
import DirectClientInterface from "@elizaos/client-direct";
import { AgentBuilder, ModelProviderName } from "@iqai/agent";
import createSequencerPlugin from "@iqai/plugin-sequencer";
import createWikiPlugin from "@iqai/plugin-wiki";
import { Laminar } from "@lmnr-ai/lmnr";

async function main() {
	// Initialize plugins
	const pluginWiki = await createWikiPlugin();
	const pluginSequencer = await createSequencerPlugin();

	// Initialize laminar
	Laminar.initialize({
		projectApiKey: process.env.LMNR_API_KEY,
	});

	// Initialize agent
	const agent = new AgentBuilder()
		.withDatabase(SqliteAdapter)
		.withClient(DirectClientInterface)
		.withModelProvider(
			ModelProviderName.OPENAI,
			process.env.OPENAI_API_KEY as string,
		)
		.withPlugins([pluginWiki, pluginSequencer])
		.withCharacter({
			name: "BrainBot",
			bio: "You are BrainBot, a helpful assistant.",
			username: "brainbot",
		})
		.build();

	await agent.start();

	// Handle process termination
	process.on("SIGINT", async () => {
		await agent.stop();
		process.exit(0);
	});

	process.on("SIGTERM", async () => {
		await agent.stop();
		process.exit(0);
	});
}

main().catch(console.error);
