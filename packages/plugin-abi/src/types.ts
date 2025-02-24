import type { Abi, Address, Chain } from "viem";
import type { z } from "zod";
import type { ContractPluginOptionsSchema } from "./lib/schema";

export type ContractPluginOptions = z.infer<typeof ContractPluginOptionsSchema>;

export interface FunctionMetadata {
	name: string;
	description: string;
	similes: string[];
	examples: string[][];
}
