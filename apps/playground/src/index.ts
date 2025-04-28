import SqliteAdapter from "@elizaos/adapter-sqlite";
import DirectClientInterface from "@elizaos/client-direct";
import { elizaLogger } from "@elizaos/core";
import { AgentBuilder, ModelProviderName } from "@iqai/agent";
import { createHeartbeatPlugin } from "@iqai/plugin-heartbeat";
import { Client } from "langsmith";
import { AISDKExporter } from "langsmith/vercel";

async function main() {
	const heartbeat = await createHeartbeatPlugin([
		{
			clients: [
				{
					type: "callback",
					callback: async (content, roomId) => {
						elizaLogger.info(content, roomId);
					},
				},
			],
			input: `
			pick a random number between 1-1000.
			this random number should always be greater than the last generated number.
			just return the number, no other text.
			Example response:
			123
			If you are the first to respond, just pick any number randomly between 1-1000.
			`,
			period: "* * * * *",
			roomName: "incrementing-numbers",
		},
	]);
	const exporter = new AISDKExporter({ client: new Client() });
	// Initialize agent
	const agent = new AgentBuilder()
		.withDatabase(SqliteAdapter)
		.withClient(DirectClientInterface)
		.withTelemetry(exporter)
		.withModelProvider(
			ModelProviderName.OPENAI,
			process.env.OPENAI_API_KEY as string,
		)
		.withPlugins([heartbeat])
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
