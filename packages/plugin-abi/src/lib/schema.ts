import { z } from "zod";
import type { Address, Abi, Chain } from "viem";

export const ContractPluginOptionsSchema = z.object({
	name: z.string(),
	description: z.string(),
	abi: z.custom<Abi>(),
	address: z.custom<Address>(),
	chain: z.custom<Chain>(),
	privateKey: z.string().optional(),
});
