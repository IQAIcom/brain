import { SqliteDatabaseAdapter } from "@elizaos/adapter-sqlite";
import DirectClientInterface from "@elizaos/client-direct";
import { ModelProviderName } from "@elizaos/core";
import { AgentBuilder } from "@iqai/agent";
import { createATPPlugin } from "@iqai/plugin-atp";
import { createFraxlendPlugin } from "@iqai/plugin-fraxlend";
import createNearPlugin from "@iqai/plugin-near";
import { createOdosPlugin } from "@iqai/plugin-odos";
import createSequencerPlugin from "@iqai/plugin-sequencer";
import Database from "better-sqlite3";
import * as fs from "node:fs";
import * as path from "node:path";
import { fraxtal } from "viem/chains";

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

	const atpPlugin = await createATPPlugin({
		walletPrivateKey: process.env.WALLET_PRIVATE_KEY,
	});

	const nearPlugin = await createNearPlugin({
		accountId: process.env.NEAR_ACCOUNT_ID as string,
		accountKey: process.env.NEAR_PRIVATE_KEY as string,
		contractId: "amm.ai-is-near.near",
		agentId: "ai-is-near.near",

		eventHandlers: {
			run_agent: {
				handler: async (payload, { account }) => {
					const request = JSON.parse(payload.message);

					const balances = await account.viewFunction({
						contractId: "amm.ai-is-near.near",
						methodName: "get_swap_balances",
						args: {
							token_in: request.token_in,
							token_out: request.token_out,
						},
					});

					const balance_in = BigInt(balances[0]);
					const balance_out = BigInt(balances[1]);
					const amount_in = BigInt(request.amount_in);

					const k = balance_in * balance_out;
					const new_balance_in = balance_in + amount_in;

					if (amount_in > 0 && new_balance_in > 0) {
						const new_balance_out = k / new_balance_in;
						const amount_out = balance_out - new_balance_out;
						return amount_out.toString();
					}

					throw new Error("Illegal amount");
				},
			},
		},
	});

	const sequencerPlugin = await createSequencerPlugin();

	// Setup database
	const dataDir = path.join(process.cwd(), "./data");
	fs.mkdirSync(dataDir, { recursive: true });
	const dbPath = path.join(dataDir, "db.sqlite");
	const databaseAdapter = new SqliteDatabaseAdapter(new Database(dbPath));

	// Build agent using builder pattern
	const agent = new AgentBuilder()
		.withDatabase(databaseAdapter)
		.withClient("direct", DirectClientInterface)
		.withModelProvider(
			ModelProviderName.OPENAI,
			process.env.OPENAI_API_KEY as string,
		)
		.withPlugins([
			fraxlendPlugin,
			odosPlugin,
			atpPlugin,
			nearPlugin,
			sequencerPlugin,
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
