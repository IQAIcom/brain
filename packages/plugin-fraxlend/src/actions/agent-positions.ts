import type { Action, Handler } from "@elizaos/core";
import { AgentPositionsService } from "../services/agent-positions";
import { WalletService } from "../services/wallet";
import type { FraxLendActionParams } from "../types";

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
			const userPositionsService = new AgentPositionsService(walletService);
			const positions = await userPositionsService.getPositions();

			callback?.({
				text: `Your current positions: ${JSON.stringify(positions)}`,
			});
			return true;
		} catch (error) {
			callback?.({
				text: `Error fetching positions: ${error.message}`,
				content: { error: error.message },
			});
			return false;
		}
	};
