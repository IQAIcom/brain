import type { Chain } from "viem";

export interface BAMMActionParams {
	chain?: Chain;
	walletPrivateKey?: string;
}
