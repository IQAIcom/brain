import type { Plugin } from "@elizaos/core";
import type { Chain } from "viem";
import { getLendAction } from "./actions/lend";
import { getBorrowAction } from "./actions/borrow";
import { getWithdrawAction } from "./actions/withdraw";
import { getAddCollateralAction } from "./actions/add-collateral";
import { getRemoveCollateralAction } from "./actions/remove-collateral";
import { getRepayAction } from "./actions/repay";

export interface BAMMPluginParams {
  chain: Chain;
  walletPrivateKey: string;
}

export const createBAMMPlugin = async (opts: BAMMPluginParams): Promise<Plugin> => {
  const actions = [
    getLendAction(opts),
    getBorrowAction(opts),
    getWithdrawAction(opts),
    getAddCollateralAction(opts),
    getRemoveCollateralAction(opts),
    getRepayAction(opts),
  ];

  return {
    name: "BAMM",
    description: "BAMM (Borrow-AMM) plugin for lending and borrowing with automatic leverage management",
    providers: [],
    evaluators: [],
    services: [],
    actions,
  };
};

export default createBAMMPlugin;
