import * as fs from "node:fs";
import * as path from "node:path";
import { SqliteDatabaseAdapter } from "@elizaos/adapter-sqlite";
import DirectClientInterface from "@elizaos/client-direct";
import {
	AgentBuilder,
	createSimplePlugin,
	ModelProviderName,
} from "@iqai/agent";
import { createAtpPlugin } from "@iqai/plugin-atp";
import { createBAMMPlugin } from "@iqai/plugin-bamm";
import { createFraxlendPlugin } from "@iqai/plugin-fraxlend";
import { createOdosPlugin } from "@iqai/plugin-odos";
import createSequencerPlugin from "@iqai/plugin-sequencer";
import Database from "better-sqlite3";
import { fraxtal } from "viem/chains";
import createHeartbeatPlugin from "@iqai/plugin-heartbeat";
import TelegramClientInterface from "@elizaos/client-telegram";
import { createPublicClient, erc20Abi, http } from "viem";

async function main() {
	// Initialize plugins
	const fraxlendPlugin = await createFraxlendPlugin({
		chain: fraxtal,
		walletPrivateKey: process.env.WALLET_PRIVATE_KEY,
	});

	const odosPlugin = await createOdosPlugin({
		chain: fraxtal,
		walletPrivateKey: process.env.WALLET_PRIVATE_KEY,
	});

	const atpPlugin = await createAtpPlugin({
		walletPrivateKey: process.env.WALLET_PRIVATE_KEY,
	});
	const sequencerPlugin = await createSequencerPlugin();

	const bammPlugin = await createBAMMPlugin({
		walletPrivateKey: process.env.WALLET_PRIVATE_KEY,
		chain: fraxtal,
	});

	const heartbeatPlugin = await createHeartbeatPlugin([
		{
			period: "*/30 * * * * *",
			input:
				"Get the top agent from atp, calculate 1% of my iq balance and buy that agent with this iq amount. go through sequencer first.",
			client: "telegram",
			config: {
				chatId: "@brainheartbeats1",
			},
		},
	]);
	const publicClient = createPublicClient({
		chain: fraxtal,
		transport: http(),
	});

	const iqBalancePlugin = createSimplePlugin({
		name: "iq-balance",
		description: "This plugin checks IQ token balance.",
		actions: [
			{
				name: "CHECK_BALANCE",
				description: "Check IQ token balance",
				similes: ["check iq balance", "iq balance", "get iq balance"],
				handler: async (opts) => {
					try {
						if (!process.env.WALLET_ADDRESS) {
							opts.callback?.({
								text: "❌ Please provide a wallet address or connect your wallet",
							});
							return false;
						}

						const balance = await publicClient.readContract({
							address: "0x6EFB84bda519726Fa1c65558e520B92b51712101",
							abi: erc20Abi,
							functionName: "balanceOf",
							args: [process.env.WALLET_ADDRESS as `0x${string}`],
						});

						// Convert balance from wei to token units (assuming 18 decimals)
						const formattedBalance = (Number(balance) / 1e18).toFixed(2);

						opts.callback?.({
							text: `💰 IQ Balance: ${formattedBalance} IQ`,
						});
						return true;
					} catch (error) {
						console.error("Error in action handler:", error);
						opts.callback?.({
							text: "❌ Failed to fetch IQ balance",
						});
						return false;
					}
				},
			},
		],
	});
	// Setup database
	const dataDir = path.join(process.cwd(), "./data");
	fs.mkdirSync(dataDir, { recursive: true });
	const dbPath = path.join(dataDir, "db.sqlite");
	const databaseAdapter = new SqliteDatabaseAdapter(new Database(dbPath));

	// Build agent using builder pattern
	const agent = new AgentBuilder()
		.withDatabase(databaseAdapter)
		.withClient("direct", DirectClientInterface)
		.withClient("telegram", TelegramClientInterface)
		.withModelProvider(
			ModelProviderName.OPENAI,
			process.env.OPENAI_API_KEY as string,
		)
		.withPlugins([
			// fraxlendPlugin,
			// odosPlugin,
			atpPlugin,
			sequencerPlugin,
			// bammPlugin,
			heartbeatPlugin,
			iqBalancePlugin,
		])
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
