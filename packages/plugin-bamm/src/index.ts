import type { Plugin } from "@elizaos/core";
import type { Chain } from "viem";
import { getAddCollateralAction } from "./actions/add-collateral";
import { getBorrowAction } from "./actions/borrow";
import { getBammPositionsAction } from "./actions/get-positions";
import { getLendAction } from "./actions/lend";
import { getBammPoolStatsAction } from "./actions/pool-stats";
import { getRemoveCollateralAction } from "./actions/remove-collateral";
import { getRepayAction } from "./actions/repay";
import { getWithdrawAction } from "./actions/withdraw";
import type { BAMMActionParams } from "./types";

export const createBAMMPlugin = async (
	opts: BAMMActionParams,
): Promise<Plugin> => {
	const actions = [
		getLendAction(opts),
		getBorrowAction(opts),
		getWithdrawAction(opts),
		getAddCollateralAction(opts),
		getRemoveCollateralAction(opts),
		getRepayAction(opts),
		getBammPositionsAction(opts),
		getBammPoolStatsAction(opts),
	];

	return {
		name: "BAMM",
		description:
			"BAMM (Borrow-AMM) plugin for lending and borrowing with automatic leverage management",
		providers: [],
		evaluators: [],
		services: [],
		actions,
	};
};

export default createBAMMPlugin;
