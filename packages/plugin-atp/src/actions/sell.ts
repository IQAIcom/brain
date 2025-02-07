import type { Action, Handler } from "@elizaos/core";
import { InputParserService } from "../services/input-parser";
import { SwapService } from "../services/swap";
import { WalletService } from "../services/wallet";
import type { ATPActionParams } from "../types";
import { SELL_AGENT_TEMPLATE } from "../lib/templates";
import { formatWeiToNumber } from "../lib/format-number";
import { elizaLogger } from "@elizaos/core";
import dedent from "dedent";

export const getSellAction = (opts: ATPActionParams): Action => {
  return {
    name: "ATP_SELL_AGENT",
    description: "Sell AI agent tokens",
    similes: [
      "SELL_AGENT",
      "DISPOSE_AGENT",
      "EXIT_AGENT_POSITION",
      "LIQUIDATE_AGENT",
    ],
    validate: async () => true,
    handler: handler(opts),
    examples: [
      [
        {
          user: "user",
          content: { text: "Sell 50 tokens of agent 0x1234...5678" },
        },
      ],
      [
        {
          user: "user",
          content: { text: "Dispose 100 tokens of Big Chungus" },
        },
      ],
    ],
  };
};

const handler: (opts: ATPActionParams) => Handler =
  (opts) => async (runtime, message, state, _options, callback) => {
    elizaLogger.info('💱 Starting token sale');
    try {
      const inputParser = new InputParserService();
      const { tokenContract, amount } = await inputParser.parseInputs({
        runtime,
        message,
        state,
        template: SELL_AGENT_TEMPLATE,
      });
      elizaLogger.info('🎯 Sell parameters', { tokenContract, amount });

      const walletService = new WalletService(opts.walletPrivateKey);
      const swapService = new SwapService(walletService);

      const result = await swapService.sell({ tokenContract, amount: BigInt(amount) });
      elizaLogger.info('📝 Transaction result', { result });

      callback?.({
        text: dedent`
          ✅ Sell Transaction Successful

          💰 Amount: ${formatWeiToNumber(amount)} tokens
          🤖 Agent: ${tokenContract}
          🔗 Transaction: ${result.txHash}

          Tokens have been sold successfully.
        `,
      });
      elizaLogger.info('✅ Sale completed successfully');
      return true;
    } catch (error) {
      elizaLogger.error('❌ Sale failed', { error });
      callback?.({
        text: dedent`
          ❌ Sell Transaction Failed

          Error: ${error.message}

          Please verify your inputs and try again.
        `,
      });
      return false;
    }
  };
