import type { Action, Handler } from "@elizaos/core";
import dedent from "dedent";
import { GET_PAIR_ADDRESS_TEMPLATE } from "../lib/templates";
import { InputParserService } from "../services/input-parser";
import { PairAddressService } from "../services/pair-address";
import { WalletService } from "../services/wallet";
import type { FraxLendActionParams } from "../types";

export const getPairAddressAction = (opts: FraxLendActionParams): Action => {
	return {
		name: "FRAXLEND_GET_PAIR_ADDRESS",
		description: "Get FraxLend pair addresses and pool information",
		similes: [
			"FIND_PAIR",
			"GET_PAIR_ADDRESS",
			"LOOKUP_PAIR",
			"FIND_POOL_ADDRESS",
			"GET_POOL_INFO",
			"SHOW_POOLS",
			"LIST_PAIRS",
			"HIGHEST_APR",
			"BEST_YIELD",
		],
		validate: async () => true,
		handler: handler(opts),
		examples: [
			[
				{
					user: "user",
					content: { text: "Find highest APR FRAX pools" },
				},
			],
			[
				{
					user: "user",
					content: { text: "Get FRAX-ETH pair address" },
				},
			],
			[
				{
					user: "user",
					content: { text: "Show all FRAX lending pools" },
				},
			],
			[
				{
					user: "user",
					content: { text: "Find lowest APR ETH pools" },
				},
			],
		],
	};
};

const handler: (opts: FraxLendActionParams) => Handler =
	(opts) => async (runtime, message, state, _options, callback) => {
		const inputParser = new InputParserService();

		try {
			const { assetSymbol, collateralSymbol, sortByApr } =
				await inputParser.parseInputs({
					runtime,
					message,
					state,
					template: GET_PAIR_ADDRESS_TEMPLATE,
				});

			if (!assetSymbol && !collateralSymbol) {
				throw new Error(
					"At least one token symbol (asset or collateral) is required",
				);
			}

			const walletService = new WalletService(
				opts.walletPrivateKey,
				opts.chain,
			);
			const pairAddressService = new PairAddressService(walletService);

			const pairs = await pairAddressService.getPairAddress({
				assetSymbol,
				collateralSymbol,
				sortByApr,
			});

			callback?.({
				text: pairAddressService.formatPairAddresses(pairs),
			});
			return true;
		} catch (error) {
			callback?.({
				text: dedent`
          ❌ Failed to Fetch Pair Address

          Error: ${error.message}

          Please provide at least one token symbol and try again.
        `,
			});
			return false;
		}
	};
