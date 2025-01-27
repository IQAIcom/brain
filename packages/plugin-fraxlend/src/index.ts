import { getLendingStatsAction } from "./actions/lending-stats";
import { getAgentPositionsAction } from "./actions/agent-positions";
import { getLendAction } from "./actions/lend";
import { getWithdrawAction } from "./actions/withdraw";
import { getBorrowAction } from "./actions/borrow";
import { getRepayAction } from "./actions/repay";
import { getAddCollateralAction } from "./actions/add-collateral";
import { getRemoveCollateralAction } from "./actions/remove-collateral";
import type { FraxLendActionParams } from "./types";
import type { Plugin } from "@elizaos/core";

export interface FraxlendConfig {
	networkId: string;
	graphqlEndpoint: string;
}

export async function createFraxlendPlugin(
	opts: FraxLendActionParams,
): Promise<Plugin> {
	const actions = [
		getLendingStatsAction(opts),
		getAgentPositionsAction(opts),
		getLendAction(opts),
		getWithdrawAction(opts),
		getBorrowAction(opts),
		getRepayAction(opts),
		getAddCollateralAction(opts),
		getRemoveCollateralAction(opts),
	];

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
