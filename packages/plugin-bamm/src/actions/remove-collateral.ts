import type { Action } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import type { BAMMActionParams } from "../types";
import { RemoveCollateralService } from "../services/remove-collateral";
import { InputParserService } from "../services/input-parser";
import dedent from "dedent";
import { formatWeiToNumber } from "../lib/format-number";
import { REMOVE_COLLATERAL_TEMPLATE } from "../lib/templates";
import { WalletService } from "../services/wallet";

export const getRemoveCollateralAction = (opts: BAMMActionParams): Action => {
  return {
    name: "BAMM_REMOVE_COLLATERAL",
    description: "Remove collateral from your BAMM position",
    similes: [
      "REMOVE_COLLATERAL",
      "WITHDRAW_COLLATERAL",
      "DECREASE_COLLATERAL",
      "PULL_COLLATERAL"
    ],
    validate: async () => true,
    handler: handler(opts),
    examples: [
      [{
        user: "user",
        content: { text: "Remove 50 ETH collateral from BAMM" }
      }]
    ]
  };
};

const handler = (opts: BAMMActionParams) => {
  return async (runtime, message, state, _options, callback) => {
    elizaLogger.info('Starting remove collateral action');
    try {
      const inputParser = new InputParserService();
      const { pairAddress, amount, error } = await inputParser.parseInputs({
        runtime,
        message,
        state,
        template: REMOVE_COLLATERAL_TEMPLATE,
      });

      if (error) {
        callback?.({
          text: `❌ ${error}`,
        });
        return false;
      }

      const walletService = new WalletService(opts.walletPrivateKey, opts.chain);
      const removeCollateralService = new RemoveCollateralService(walletService);

      const result = await removeCollateralService.execute({
        pairAddress,
        amount: BigInt(amount)
      });

      callback?.({
        text: dedent`
          ✅ Collateral Removal Successful

          🔓 Amount: ${formatWeiToNumber(amount)} tokens
          🔗 Transaction: ${result.txHash}

          Collateral has been removed from your BAMM position.
        `,
      });
      return true;
    } catch (error) {
      callback?.({
        text: dedent`
          ❌ Collateral Removal Failed

          Error: ${error.message}

          Please verify your inputs and try again.
        `,
      });
      return false;
    }
  };
};
