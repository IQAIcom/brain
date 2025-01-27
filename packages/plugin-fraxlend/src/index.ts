import { getDepositAction } from "./actions/deposit";
import { getLendingStatsAction } from "./actions/lending-stats";
import { getAgentPositionsAction } from "./actions/agent-positions";
import { getLendAction } from "./actions/lend";
import { getWithdrawAction } from "./actions/withdraw";
import type { FraxLendActionParams } from "./types";

export interface FraxlendConfig {
	networkId: string;
	graphqlEndpoint: string;
}

export async function createFraxlendPlugin(opts: FraxLendActionParams) {
	const actions = {
		getDepositAction: getDepositAction(opts),
		getLendingStatsAction: getLendingStatsAction(opts),
		getAgentPositionsAction: getAgentPositionsAction(opts),
		getLendAction: getLendAction(opts),
		getWithdrawAction: getWithdrawAction(opts),
	};

	return {
		name: "Fraxlend Integration",
		description: "Fraxlend integration plugin for lending operations",
		providers: [],
		evaluators: [],
		services: [],
		actions,
	};
}

export default createFraxlendPlugin;
