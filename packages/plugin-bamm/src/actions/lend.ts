import type { Action } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import dedent from "dedent";
import formatNumber from "../lib/format-number";
import { LEND_TEMPLATE } from "../lib/templates";
import { InputParserService } from "../services/input-parser";
import { LendService } from "../services/lend";
import { WalletService } from "../services/wallet";
import type { BAMMActionParams } from "../types";

export const getLendAction = (opts: BAMMActionParams): Action => {
	return {
		name: "BAMM_LEND",
		description: "Lend assets to a BAMM pool",
		similes: ["LEND", "SUPPLY", "DEPOSIT", "PROVIDE_LIQUIDITY"],
		validate: async () => true,
		handler: handler(opts),
		examples: [
			[
				{
					user: "user",
					content: {
						text: "lend 10k lp tokens to 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84 bamm",
					},
				},
				{
					user: "system",
					content: {
						text: `
							✅ Lending Transaction Successful

							🏦 BAMM Address: 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84
							💰 Amount Lent: 10.00K
							🔗 Transaction: 0xa20d7ffe93d1b2eb1c24e97904a9f32cd9e87cdc8dd076c6e95d36e37063b074

							LP Tokens have been successfully lent to the BAMM pool.
						`,
					},
				},
			],
		],
	};
};

const handler = (opts: BAMMActionParams) => {
	return async (runtime, message, state, _options, callback) => {
		elizaLogger.info("Starting lend action");
		try {
			const inputParser = new InputParserService();
			const { bammAddress, amount, error } = await inputParser.parseInputs({
				runtime,
				message,
				state,
				template: LEND_TEMPLATE,
			});
			elizaLogger.info(
				`
				Lend Params:
					BAMM Address: ${bammAddress}
					Amount: ${amount}
				`,
			);
			if (error) {
				callback?.({
					text: `❌ ${error}`,
				});
				return false;
			}

			const walletService = new WalletService(
				opts.walletPrivateKey,
				opts.chain,
			);
			const lendService = new LendService(walletService);

			const result = await lendService.execute({
				bammAddress,
				amount,
			});

			callback?.({
				text: dedent`
          ✅ Lending Transaction Successful

          🏦 BAMM Address: ${bammAddress}
          💰 Amount Lent: ${formatNumber(amount)}
          🔗 Transaction: ${result.txHash}

          LP Tokens have been successfully lent to the BAMM pool.
        `,
			});
			return true;
		} catch (error) {
			callback?.({
				text: dedent`
          ❌ Lending Transaction Failed

          Error: ${error.message}

          Please verify your inputs and try again.
        `,
			});
			return false;
		}
	};
};
