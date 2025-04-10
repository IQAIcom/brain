import openaiPlugin from "@elizaos/plugin-openai";
import sqlPlugin from "@elizaos/plugin-sql";
import { AgentBuilder } from "@iqai/agent";
import { createWikiPlugin } from "@iqai/plugin-wiki";

async function main() {
	// Initialize plugins
	const wikiPlugin = await createWikiPlugin();

	// Initialize agent
	const agent = new AgentBuilder()
		.withModelProvider(openaiPlugin)
		.withPlugins([wikiPlugin, sqlPlugin])
		.withCharacter({
			name: "AbiBot",
			bio: "You are BrainBot, a helpful ABI assistant.",
			username: "AbiBot",
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
