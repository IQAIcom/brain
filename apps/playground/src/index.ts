import SqliteAdapter from "@elizaos/adapter-sqlite";
import { DirectClientInterface } from "@elizaos/client-direct";
import { AgentBuilder, ModelProviderName } from "@iqai/agent";
import { createMcpPlugin } from "@iqai/plugin-mcp";
import createSequencerPlugin from "@iqai/plugin-sequencer";
import { Laminar } from "@lmnr-ai/lmnr";

async function main() {
	const pluginCryo = await createMcpPlugin({
		name: "Cryo-mcp",
		description: "mcp server for cryo",
		transport: {
			mode: "stdio",
			command: "uvx",
			args: ["cryo-mcp", "--rpc-url", "http://localhost:8545"],
		},
	});
	const pluginFs = await createMcpPlugin({
		name: "file-system",
		description: "file system mcp server",
		transport: {
			mode: "stdio",
			command: "npx",
			args: [
				"-y",
				"@modelcontextprotocol/server-filesystem",
				"/Users/prudhvisuraaj/",
			],
		},
	});
	const sequencer = await createSequencerPlugin();
	Laminar.initialize({
		projectApiKey: process.env.LAMINAR_API_KEY,
	});

	// Create agent with plugin
	const agent = new AgentBuilder()
		.withDatabase(SqliteAdapter)
		.withClient(DirectClientInterface)
		.withModelProvider(
			ModelProviderName.OPENAI,
			process.env.OPENAI_API_KEY as string,
		)
		.withPlugins([pluginCryo, pluginFs])
		.withCharacter({
			name: "BrainBot mcp",
			bio: "You are BrainBot, a bot that can use mcp servers",
			system:
				"Make use of all the mcp servers available to you to achieve the goal",
			username: "brainbot",
			messageExamples: [],
			lore: ["Created to assist users with mcp server"],
			style: {
				all: ["Professional"],
				chat: ["Friendly"],
				post: ["Clear"],
			},
		})
		.build();

	await agent.start();
}

main().catch(console.error);
