import type { Plugin } from "@elizaos/core";
import { getAddCollateralAction } from "./actions/add-collateral";
import { getAgentPositionsAction } from "./actions/agent-positions";
import { getBorrowAction } from "./actions/borrow";
import { getPairAddressAction } from "./actions/get-pair-address";
import { getLendAction } from "./actions/lend";
import { getLendingStatsAction } from "./actions/lending-stats";
import { getRemoveCollateralAction } from "./actions/remove-collateral";
import { getRepayAction } from "./actions/repay";
import { getWithdrawAction } from "./actions/withdraw";
import type { FraxLendActionParams } from "./types";

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
		getPairAddressAction(opts),
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
