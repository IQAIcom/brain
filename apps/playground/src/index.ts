import SqliteAdapter from "@elizaos/adapter-sqlite";
import DirectClientInterface from "@elizaos/client-direct";
import { AgentBuilder, ModelProviderName } from "@iqai/agent";
import { createAbiPlugin } from "@iqai/Plugin-abi";
import { erc20Abi } from "viem";

async function main() {
	// Initialize plugins
	const abiPlugin = await createAbiPlugin({
		abi: erc20Abi,
		contractName: "ERC20",
		contractAddress: "0xaB195B090Cc60C1EFd4d1cEE94Bf441F5931C01b",
		description: "ERC20 token contract",
		privateKey: process.env.WALLET_PRIVATE_KEY as string,
	});

	// Initialize agent
	const agent = new AgentBuilder()
		.withDatabase(SqliteAdapter)
		.withClient(DirectClientInterface)
		.withModelProvider(
			ModelProviderName.OPENAI,
			process.env.OPENAI_API_KEY as string,
		)
		.withPlugins([abiPlugin])
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
