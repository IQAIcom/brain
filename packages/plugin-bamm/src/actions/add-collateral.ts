import type { Action } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import type { BAMMActionParams } from "../types";
import { AddCollateralService } from "../services/add-collateral";
import dedent from "dedent";
import { formatWeiToNumber } from "../lib/format-number";
import { WalletService } from "../services/wallet";
import { ADD_COLLATERAL_TEMPLATE } from "../lib/templates";
import { InputParserService } from "../services/input-parser";

export const getAddCollateralAction = (opts: BAMMActionParams): Action => {
  return {
    name: "BAMM_ADD_COLLATERAL",
    description: "Add collateral to your BAMM position",
    similes: [
      "ADD_COLLATERAL",
      "DEPOSIT_COLLATERAL",
      "INCREASE_COLLATERAL",
      "TOP_UP_COLLATERAL"
    ],
    validate: async () => true,
    handler: handler(opts),
    examples: [
      [{
        user: "user",
        content: { text: "Add 100 ETH as collateral to BAMM" }
      }]
    ]
  };
};


const handler = (opts: BAMMActionParams) => {
  return async (runtime, message, state, _options, callback) => {
    elizaLogger.info('Starting add collateral action');
    try {
      const inputParser = new InputParserService();
      const { pairAddress, amount, error } = await inputParser.parseInputs({
        runtime,
        message,
        state,
        template: ADD_COLLATERAL_TEMPLATE,
      });

      if (error) {
        callback?.({
          text: `❌ ${error}`,
        });
        return false;
      }

      const walletService = new WalletService(opts.walletPrivateKey, opts.chain);
      const addCollateralService = new AddCollateralService(walletService);

      const result = await addCollateralService.execute({
        pairAddress,
        collateralAmount: BigInt(amount),
      });

      callback?.({
        text: dedent`
          ✅ Collateral Addition Successful

          🔒 Amount: ${formatWeiToNumber(amount)} tokens
          🔗 Transaction: ${result.txHash}

          Collateral has been added to your BAMM position.
        `,
      });
      return true;
    } catch (error) {
      callback?.({
        text: dedent`
          ❌ Collateral Addition Failed

          Error: ${error.message}

          Please verify your inputs and try again.
        `,
      });
      return false;
    }
  };
};

