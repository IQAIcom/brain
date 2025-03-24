import SqliteAdapter from "@elizaos/adapter-sqlite";
import DirectClientInterface from "@elizaos/client-direct";
import { AgentBuilder, ModelProviderName } from "@iqai/agent";
import createWikiPlugin from "@iqai/plugin-wiki";
import { Client } from "langsmith";
import { AISDKExporter } from "langsmith/vercel";

async function main() {
	// Initialize plugins
	const pluginWiki = await createWikiPlugin();

	// Initialize telemetry
	const telemetryExporter = new AISDKExporter({ client: new Client() });

	// Build agent using builder pattern with telemetry
	const agent = new AgentBuilder()
		.withDatabase(SqliteAdapter)
		.withClient(DirectClientInterface)
		.withModelProvider(
			ModelProviderName.OPENAI,
			process.env.OPENAI_API_KEY as string,
		)
		.withPlugin(pluginWiki)
		.withCharacter({
			name: "BrainBot",
			bio: "You are BrainBot, a helpful assistant.",
			username: "brainbot",
		})
		.withTelemetry(telemetryExporter)
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
