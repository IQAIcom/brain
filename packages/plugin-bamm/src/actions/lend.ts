import type { Action } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import type { BAMMActionParams } from "../types";
import { LendService } from "../services/lend";
import { InputParserService } from "../services/input-parser";
import dedent from "dedent";
import { formatWeiToNumber } from "../lib/format-number";
import { LEND_TEMPLATE } from "../lib/templates";
import { WalletService } from "../services/wallet";

export const getLendAction = (opts: BAMMActionParams): Action => {
  return {
    name: "BAMM_LEND",
    description: "Lend LP tokens to a BAMM pool",
    similes: [
      "LEND",
      "PROVIDE_LIQUIDITY",
      "DEPOSIT_LP",
      "ADD_LIQUIDITY",
      "SUPPLY_LP"
    ],
    validate: async () => true,
    handler: handler(opts),
    examples: [
      [{
        user: "user",
        content: { text: "Lend 100 LP tokens to BAMM pool" }
      }]
    ]
  };
};

const handler = (opts: BAMMActionParams) => {
  return async (runtime, message, state, _options, callback) => {
    elizaLogger.info('Starting lending action');
    try {
      const inputParser = new InputParserService();
      const { poolAddress, amount, error } = await inputParser.parseInputs({
        runtime,
        message,
        state,
        template: LEND_TEMPLATE,
      });

      if (error) {
        callback?.({
          text: `❌ ${error}`,
        });
        return false;
      }

      const walletService = new WalletService(opts.walletPrivateKey, opts.chain);
      const lendService = new LendService(walletService);

      const result = await lendService.execute({
        pairAddress: poolAddress,
        amount: BigInt(amount)
      });

      callback?.({
        text: dedent`
          ✅ Lending Transaction Successful

          💰 Amount: ${formatWeiToNumber(amount)} LP tokens
          🔗 Transaction: ${result.txHash}

          LP tokens have been lent to the BAMM pool.
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
