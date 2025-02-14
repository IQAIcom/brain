import type { Chain } from "viem";

export interface BAMMPluginParams {
  walletPrivateKey?: string;
  chain?: Chain;
}

export interface BAMMActionParams {
  chain: Chain;
  walletPrivateKey: string;
}
