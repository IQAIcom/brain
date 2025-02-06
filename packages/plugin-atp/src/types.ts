import type { Chain } from "viem";

export interface ATPActionParams {
	walletPrivateKey?: string;
	chain?: Chain;
}

export interface AgentHolding {
	tokenContract: string;
	tokenAmount: string;
	name: string;
	currentPriceInUsd: number;
}

export interface AgentPositionsResponse {
	count: number;
	holdings: AgentHolding[];
}

export interface AgentStats {
  currentPriceInIq: number;
  currentPriceInUSD: number;
  marketCap: number;
  changeIn24h: number;
  holdersCount: number;
  inferenceCount: number;
  category: string;
}
