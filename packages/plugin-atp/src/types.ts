import type { Chain } from "viem";

export interface ATPActionParams {
	walletPrivateKey?: string;
	chain?: Chain;
}
