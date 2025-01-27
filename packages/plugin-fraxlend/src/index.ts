import { getLendingStatsAction } from "./actions/lending-stats";
import { getAgentPositionsAction } from "./actions/agent-positions";
import { getLendAction } from "./actions/lend";
import { getWithdrawAction } from "./actions/withdraw";
import { getBorrowAction } from "./actions/borrow";
import { getRepayAction } from "./actions/repay";
import { getAddCollateralAction } from "./actions/add-collateral";
import { getRemoveCollateralAction } from "./actions/remove-collateral";
import type { FraxLendActionParams } from "./types";

export interface FraxlendConfig {
	networkId: string;
	graphqlEndpoint: string;
}

export async function createFraxlendPlugin(opts: FraxLendActionParams) {
	const actions = {
		getLendingStatsAction: getLendingStatsAction(opts),
		getAgentPositionsAction: getAgentPositionsAction(opts),
		getLendAction: getLendAction(opts),
		getWithdrawAction: getWithdrawAction(opts),
		getBorrowAction: getBorrowAction(opts),
		getRepayAction: getRepayAction(opts),
		getAddCollateralAction: getAddCollateralAction(opts),
		getRemoveCollateralAction: getRemoveCollateralAction(opts),
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
