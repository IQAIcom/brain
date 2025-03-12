import type { Action, Handler } from "@elizaos/core";
import { GetHoldingsService } from "../services/get-holdings";
import { GET_HOLDINGS_TEMPLATE } from "../lib/templates";
import { elizaLogger } from "@elizaos/core";
import { InputParserService } from "../services/input-parser";
import type { WalletActionParams } from "../types";
import type { ChainName } from "@covalenthq/client-sdk";
import { toChainName } from "../lib/chain-utils";

export const getHoldingsAction = (opts: WalletActionParams): Action => {
	return {
		name: "WALLET_GET_HOLDINGS",
		description: "Get token holdings for a wallet on a specific blockchain",
		similes: [
			"GET_HOLDINGS",
			"SHOW_HOLDINGS",
			"VIEW_BALANCE",
			"CHECK_TOKENS",
			"WALLET_CONTENTS",
			"MY_TOKENS",
		],
		validate: async () => true,
		handler: handler(opts),
		examples: [
			[
				{
					user: "user",
					content: {
						text: "get my holdings on fraxtal",
					},
				},
			],
			[
				{
					user: "user",
					content: {
						text: "get holdings of 0x1231241241212... on polygon",
					},
				},
			],
		],
	};
};

const handler: (opts: WalletActionParams) => Handler =
	(opts) => async (runtime, message, state, _options, callback) => {
		elizaLogger.info("🔍 Getting wallet holdings");
		try {
			const inputParser = new InputParserService();
			const { chain, address, error } = await inputParser.parseInputs({
				runtime,
				message,
				state,
				template: GET_HOLDINGS_TEMPLATE,
			});

			elizaLogger.info(`Get holdings params:
        chain: ${chain}
        address: ${address}
        error: ${error}
      `);

			if (error) {
				callback?.({
					text: `❌ Error: ${error}`,
				});
				return false;
			}

			if (!chain) {
				callback?.({
					text: "Please specify which blockchain you'd like to check your holdings on.",
				});
				return false;
			}

			const chainName: ChainName = toChainName(chain);

			const holdingsService = new GetHoldingsService(opts.covalentApiKey);
			const holdings = await holdingsService.getHoldings({
				chain: chainName,
				address: address ?? opts.walletAddress,
			});

			const formattedHoldings = holdingsService.formatHoldings(holdings, chain);
			callback?.({
				text: formattedHoldings,
			});
			elizaLogger.info("✅ Holdings fetched successfully");
			return true;
		} catch (error) {
			elizaLogger.error("❌ Holdings fetch failed", { error });
			callback?.({
				text: `❌ Error: ${error.message}`,
			});
			return false;
		}
	};
