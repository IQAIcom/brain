import SqliteAdapter from "@elizaos/adapter-sqlite";
import DirectClientInterface from "@elizaos/client-direct";
import { AgentBuilder, ModelProviderName } from "@iqai/agent";
import createWikiPlugin from "@iqai/plugin-wiki";
import { LangfuseExporter } from "langfuse-vercel";

async function main() {
	// Initialize plugins
	const pluginWiki = await createWikiPlugin();

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
			messageExamples: [],
			lore: [],
			style: {
				all: [],
				chat: [],
				post: [],
			},
		})
		.withTelemetry(
			new LangfuseExporter({
				secretKey: process.env.LANGFUSE_SECRET_KEY,
				publicKey: process.env.LANGFUSE_PUBLIC_KEY,
				baseUrl: process.env.LANGFUSE_BASEURL,
			}),
			2000,
		)
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
