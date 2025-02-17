import type { Chain } from "viem";

export interface BAMMActionParams {
	chain?: Chain;
	walletPrivateKey?: string;
}

export interface PoolStats {
	poolAddress: string;
	bammAddress: string;
	bammApr: number;
	fraxswapApr: number;
	poolName: string;
	createdAtTimestamp: string;
	createdAtBlock: number;
	createdAtTransactionHash: string;
	chain: string;
	token0Address: string;
	token0Symbol: string;
	token0AmountLocked: number;
	token0AmountLockedAmm: number;
	token0AmountLockedTwamm: number;
	token1Address: string;
	token1Symbol: string;
	token1AmountLocked: number;
	token1AmountLockedAmm: number;
	token1AmountLockedTwamm: number;
	feePercentage: number;
	tvl: number;
	volumeAdd24H: number;
	volumeAdd7D: number;
	volumeAddAllTime: number;
	volumeRemove24H: number;
	volumeRemove7D: number;
	volumeRemoveAllTime: number;
	volumeSwap24H: number;
	volumeSwap7D: number;
	volumeSwapAllTime: number;
	fees24H: number;
	fees7D: number;
	feesAllTime: number;
	swapTransactionCount24H: number;
	swapTransactionCount7D: number;
	swapTransactionCountAllTime: number;
	liquidityTransactionCount24H: number;
	liquidityTransactionCount7D: number;
	liquidityTransactionCountAllTime: number;
}
