import type { Action, Handler } from "@elizaos/core";
import { AgentPositionsService } from "../services/agent-positions";
import { WalletService } from "../services/wallet";
import type { ATPActionParams } from "../types";

export const getAgentPositionsAction = (opts: ATPActionParams): Action => {
  return {
    name: "ATP_GET_POSITIONS",
    description: "Get your positions in ATP AI Tokens",
    similes: [
      "GET_POSITIONS_AI_TOKENS",
      "VIEW_POSITIONS_AI_TOKENS",
      "CHECK_POSITIONS_AI_TOKENS",
      "GET_POSITIONS_AI_TOKENS",
      "SHOW_POSITIONS_AI_TOKENS",
    ],
    validate: async () => true,
    handler: handler(opts),
    examples: [],
  };
};

const handler: (opts: ATPActionParams) => Handler =
  (opts) => async (_runtime, _message, _state, _options, callback) => {
    try {
      const walletService = new WalletService(opts.walletPrivateKey,opts.chain);
      const positionsService = new AgentPositionsService(walletService);

      const positions = await positionsService.getPositions();
      const formattedPositions = positionsService.formatPositions(positions);

      callback?.({
        text: formattedPositions,
      });
      return true;
    } catch (error) {
      callback?.({
        text: `❌ Error: ${error.message}`,
      });
      return false;
    }
  };
