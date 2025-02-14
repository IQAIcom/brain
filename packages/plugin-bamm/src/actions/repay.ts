import type { Action } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import type { BAMMActionParams } from "../types";
import { RepayService } from "../services/repay";
import { InputParserService } from "../services/input-parser";
import dedent from "dedent";
import { formatWeiToNumber } from "../lib/format-number";
import { REPAY_TEMPLATE } from "../lib/templates";
import { WalletService } from "../services/wallet";

export const getRepayAction = (opts: BAMMActionParams): Action => {
  return {
    name: "BAMM_REPAY",
    description: "Repay borrowed assets to BAMM pool",
    similes: [
      "REPAY",
      "PAY_BACK",
      "RETURN_LOAN",
      "SETTLE_DEBT",
      "CLEAR_LOAN"
    ],
    validate: async () => true,
    handler: handler(opts),
    examples: [
      [{
        user: "user",
        content: { text: "Repay 500 USDC to BAMM pool" }
      }]
    ]
  };
};

const handler = (opts: BAMMActionParams) => {
  return async (runtime, message, state, _options, callback) => {
    elizaLogger.info('Starting repay action');
    try {
      const inputParser = new InputParserService();
      const { pairAddress, amount, error } = await inputParser.parseInputs({
        runtime,
        message,
        state,
        template: REPAY_TEMPLATE,
      });

      if (error) {
        callback?.({
          text: `❌ ${error}`,
        });
        return false;
      }

      const walletService = new WalletService(opts.walletPrivateKey, opts.chain);
      const repayService = new RepayService(walletService);

      const result = await repayService.execute({
        pairAddress,
        amount: BigInt(amount)
      });

      callback?.({
        text: dedent`
          ✅ Repayment Successful

          💰 Amount Repaid: ${formatWeiToNumber(amount)} tokens
          🔗 Transaction: ${result.txHash}

          Loan has been partially or fully repaid.
        `,
      });
      return true;
    } catch (error) {
      callback?.({
        text: dedent`
          ❌ Repayment Failed

          Error: ${error.message}

          Please verify your inputs and try again.
        `,
      });
      return false;
    }
  };
};
