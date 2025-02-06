import type { Action, Handler } from "@elizaos/core";
import { AgentPositionsService } from "../services/agent-positions";
import { WalletService } from "../services/wallet";
import type { FraxLendActionParams } from "../types";
import dedent from "dedent";

export const getAgentPositionsAction = (opts: FraxLendActionParams): Action => {
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

const handler: (opts: FraxLendActionParams) => Handler =
	(opts) => async (_runtime, _message, _state, _options, callback) => {
		try {
			const walletService = new WalletService(
				opts.walletPrivateKey,
				opts.chain,
			);
			const agentPositionsService = new AgentPositionsService(walletService);
			const positions = await agentPositionsService.getPositions();

			callback?.({
				text: agentPositionsService.formatPositions(positions),
			});
			return true;
		} catch (error) {
			callback?.({
				text: dedent`
					❌ Failed to Fetch Positions

					Error: ${error.message}

					Please try again later.
				`,
			});
			return false;
		}
	};
