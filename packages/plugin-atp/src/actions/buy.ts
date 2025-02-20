import type { Action, Handler } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import dedent from "dedent";
import { BUY_AGENT_TEMPLATE } from "../lib/templates";
import { InputParserService } from "../services/input-parser";
import { SwapService } from "../services/swap";
import { WalletService } from "../services/wallet";
import type { ATPActionParams } from "../types";

export const getBuyAction = (opts: ATPActionParams): Action => {
	return {
		name: "ATP_BUY_AGENT",
		description: "Buy AI agent tokens",
		similes: [
			"BUY_AGENT",
			"PURCHASE_AGENT",
			"GET_AGENT_TOKENS",
			"ACQUIRE_AGENT",
		],
		validate: async () => true,
		handler: handler(opts),
		examples: [
			[
				{
					user: "user",
					content: { text: "Buy with 1000 IQ of agent 0x1234...5678" },
				},
			],
			[
				{
					user: "user",
					content: { text: "Purchase using 500 IQ of Big Chungus" },
				},
			],
		],
	};
};

const handler: (opts: ATPActionParams) => Handler =
	(opts) => async (runtime, message, state, _options, callback) => {
		elizaLogger.info("💰 Starting token purchase");
		try {
			const inputParser = new InputParserService();
			const { tokenContract, amount, error } = await inputParser.parseInputs({
				runtime,
				message,
				state,
				template: BUY_AGENT_TEMPLATE,
			});
			if (error) {
				callback?.({
					text: dedent`
          ❌ Error: ${error}
        `,
				});
				return true;
			}
			elizaLogger.info("🎯 Buy parameters", { tokenContract, amount });

			const walletService = new WalletService(opts.walletPrivateKey);
			const swapService = new SwapService(walletService);

			const result = await swapService.buy({ tokenContract, amount });

			callback?.({
				text: dedent`
          ✅ Buy Transaction Successful

          💰 Amount: ${amount} IQ
          🤖 Agent: ${tokenContract}
          🔗 Transaction: ${result.txHash}

          Tokens have been purchased successfully.
        `,
			});
			return true;
		} catch (error) {
			elizaLogger.error("❌ Purchase failed", { error });
			callback?.({
				text: dedent`
          ❌ Buy Transaction Failed

          Error: ${error.message}

          Please verify your inputs and try again.
        `,
			});
			return false;
		}
	};
