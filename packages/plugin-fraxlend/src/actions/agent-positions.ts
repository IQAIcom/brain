import type { Action, Handler } from "@elizaos/core";
import { AgentPositionsService } from "../services/agent-positions";
import { WalletService } from "../services/wallet";
import type { FraxLendActionParams } from "../types";
import dedent from "dedent";

export const getAgentPositionsAction = (opts: FraxLendActionParams): Action => {
	return {
		name: "FRAXLEND_GET_POSITIONS",
		description: "Get your positions in FraxLend pools",
		similes: [
			"VIEW_POSITIONS",
			"CHECK_BALANCE",
			"GET_HOLDINGS",
			"VIEW_PORTFOLIO",
			"CHECK_POSITIONS",
			"SHOW_ASSETS",
			"VIEW_INVESTMENTS",
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
