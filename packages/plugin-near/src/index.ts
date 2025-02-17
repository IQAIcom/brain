import type { Plugin } from "@elizaos/core";

export async function createNearPlugin(
	opts: NearActionParams,
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
