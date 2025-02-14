import type { Plugin } from "@elizaos/core";
import type { Chain } from "viem";
import { getBAMMActions } from "./actions";
import { getLendAction } from "./actions/lend";
import { getBorrowAction } from "./actions/borrow";

export interface BAMMPluginParams {
  chain: Chain;
  walletPrivateKey: string;
}

export const createBAMMPlugin = async ({
  chain,
  walletPrivateKey,
}: BAMMPluginParams): Promise<Plugin> => {
  const actions = [
    getLendAction({ chain, walletPrivateKey }),
    getBorrowAction({ chain, walletPrivateKey })
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
