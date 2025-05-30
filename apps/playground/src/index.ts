import SqliteAdapter from "@elizaos/adapter-sqlite";
import DirectClientInterface from "@elizaos/client-direct";
import { AgentBuilder, ModelProviderName } from "@iqai/agent";
import { createWikiPlugin } from "@iqai/plugin-wiki";

async function main() {
	const pluginWiki = await createWikiPlugin();
	// Initialize agent
	const agent = new AgentBuilder()
		.withDatabase(SqliteAdapter)
		.withClient(DirectClientInterface)
		.withModelProvider(
			ModelProviderName.GOOGLE,
			process.env.GOOGLE_API_KEY as string,
		)
		.withPlugins([pluginWiki])
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
