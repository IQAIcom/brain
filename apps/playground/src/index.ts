import SqliteAdapter from "@elizaos/adapter-sqlite";
import DirectClient from "@elizaos/client-direct";
import TelegramClient from "@elizaos/client-telegram";
import { AgentBuilder, ModelProviderName } from "@iqai/agent";
import { createAtpPlugin } from "@iqai/plugin-atp";
import createSequencerPlugin from "@iqai/plugin-sequencer";

async function main() {
	// Initialize plugins
	const atpPlugin = await createAtpPlugin({
		walletPrivateKey: process.env.WALLET_PRIVATE_KEY,
	});
	const sequencerPlugin = await createSequencerPlugin();

	// Build agent using builder pattern
	const agent = new AgentBuilder()
		.withDatabase(SqliteAdapter)
		.withClients([DirectClient, TelegramClient])
		.withModelProvider(
			ModelProviderName.OPENAI,
			process.env.OPENAI_API_KEY as string,
		)
		.withPlugins([atpPlugin, sequencerPlugin])
		.build();

	await agent.start();
}

main().catch(console.error);
