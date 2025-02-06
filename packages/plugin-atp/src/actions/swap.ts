import type { Action, Handler } from "@elizaos/core";
import { InputParserService } from "../services/input-parser";
import { SwapService } from "../services/swap";
import { WalletService } from "../services/wallet";
import type { ATPActionParams } from "../types";
import { SWAP_TEMPLATE } from "../lib/templates";
import { formatWeiToNumber } from "../lib/format-number";
import { elizaLogger } from "@elizaos/core";
import dedent from "dedent";

export const getSwapAction = (opts: ATPActionParams): Action => {
  return {
    name: "ATP_BUY_SELL",
    description: "swap (Buy or Sell) ai tokens on IQ ATP",
    similes: [
      "BUY_ATP_AI_TOKENS",
      "SELL_ATP_AI_TOKENS",
      "BUY_AGENT",
      "SELL_AGENT",
      "PURCHASE_AGENT",
      "DISPOSE_AGENT",
    ],
    validate: async () => true,
    handler: handler(opts),
    examples: [],
  };
};

const handler: (opts: ATPActionParams) => Handler =
  (opts) => async (runtime, message, state, _options, callback) => {
    elizaLogger.info('💱 Starting token swap');
    try {
      const inputParser = new InputParserService();
      const { agentAddress, amount, action } = await inputParser.parseInputs({
        runtime,
        message,
        state,
        template: SWAP_TEMPLATE,
      });
      elizaLogger.debug('🎯 Swap parameters', { agentAddress, amount, action });

      const walletService = new WalletService(opts.walletPrivateKey);
      const swapService = new SwapService(walletService);

      const result = action === 'buy'
        ? await swapService.buy({ agentAddress, amount: BigInt(amount) })
        : await swapService.sell({ agentAddress, amount: BigInt(amount) });
      elizaLogger.debug('📝 Transaction result', { result });

      callback?.({
        text: dedent`
          ✅ ${action.toUpperCase()} Transaction Successful

          💰 Amount: ${formatWeiToNumber(amount)} tokens
          🤖 Agent: ${agentAddress}
          🔗 Transaction: ${result.txHash}

          Tokens have been ${action === 'buy' ? 'purchased' : 'sold'} successfully.
        `,
      });
      elizaLogger.info('✅ Swap completed successfully');
      return true;
    } catch (error) {
      elizaLogger.error('❌ Swap failed', { error });
      callback?.({
        text: dedent`
          ❌ Swap Transaction Failed

          Error: ${error.message}

          Please verify your inputs and try again.
        `,
      });
      return false;
    }
  };
