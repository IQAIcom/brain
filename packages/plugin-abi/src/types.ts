import type { Chain } from "viem";

export interface AbiPluginOptions {
	abi: any[];
	contractName: string;
	contractAddress: `0x${string}`;
	description: string;
	privateKey: string;
	chain?: Chain;
}

export interface FunctionMetadata {
	name: string;
	stateMutability: string;
	inputs: any[];
	outputs: any[];
	isReadFunction: boolean;
}
