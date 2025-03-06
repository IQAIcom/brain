import type { Action, Handler } from "@elizaos/core";
import { GetTransactionsService } from "../services/get-transactions";
import { GET_TRANSACTIONS_TEMPLATE } from "../lib/templates";
import { elizaLogger } from "@elizaos/core";
import { isValidChainName, toChainName } from "../lib/chain-utils";
import type { WalletActionParams } from "../types";
import { InputParserService } from "../services/input-parser";

export const getTransactionsAction = (opts: WalletActionParams): Action => {
	return {
		name: "WALLET_GET_TRANSACTIONS",
		description:
			"Get transaction history for a wallet on a specific blockchain",
		similes: [
			"GET_TRANSACTIONS",
			"SHOW_TRANSACTIONS",
			"VIEW_TRANSACTIONS",
			"CHECK_TRANSACTIONS",
			"TRANSACTION_HISTORY",
			"RECENT_TRANSACTIONS",
		],
		validate: async () => true,
		handler: handler(opts),
		examples: [
			[
				{
					user: "user",
					content: {
						text: "get my transactions on fraxtal",
					},
				},
			],
			[
				{
					user: "user",
					content: {
						text: "get my last 5 txns on fraxtal",
					},
				},
			],
			[
				{
					user: "user",
					content: {
						text: "get latest txns of 0x1234567890123456789012345678901234567890 on fraxtal",
					},
				},
			],
		],
	};
};

const handler: (opts: WalletActionParams) => Handler =
	(opts) => async (runtime, message, state, _options, callback) => {
		elizaLogger.info("🔍 Getting wallet transactions");
		try {
			const inputParser = new InputParserService();
			const { chain, address, limit, error } = await inputParser.parseInputs({
				runtime,
				message,
				state,
				template: GET_TRANSACTIONS_TEMPLATE,
			});

			elizaLogger.info(`Get transactions params:
        chain: ${chain}
        address: ${address}
        limit: ${limit}
        error: ${error}
      `);

			if (error) {
				callback?.({
					text: `❌ Error: ${error}`,
				});
				return false;
			}

			// Validate chain name
			if (!isValidChainName(chain)) {
				callback?.({
					text: `❌ Error: "${chain}" is not a supported blockchain. Please use one of the supported chains.`,
				});
				return false;
			}

			const chainName = toChainName(chain);
			const walletAddress = address || opts.walletAddress;

			if (!walletAddress) {
				callback?.({
					text: "❌ Error: No wallet address provided and no default address configured.",
				});
				return false;
			}

			const transactionsService = new GetTransactionsService(
				opts.covalentApiKey,
			);
			const transactions = await transactionsService.getTransactions({
				chain: chainName,
				address: walletAddress,
				limit,
			});

			const formattedTransactions = transactionsService.formatTransactions(
				transactions,
				chain,
			);

			callback?.({
				text: formattedTransactions,
			});
			elizaLogger.info("✅ Transactions fetched successfully");
			return true;
		} catch (error) {
			elizaLogger.error("❌ Transactions fetch failed", { error });
			callback?.({
				text: `❌ Error: ${error.message}`,
			});
			return false;
		}
	};
