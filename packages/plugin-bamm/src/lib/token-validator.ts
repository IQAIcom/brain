import type { Address } from "viem";
import type { PublicClient } from "viem";
import { BAMM_ABI } from "./bamm.abi";

export interface TokenValidationResult {
	isToken0: boolean;
	isToken1: boolean;
	token0Address: Address;
	token1Address: Address;
}

export async function validateTokenAgainstBAMM(
	bammAddress: Address,
	tokenAddress: Address,
	publicClient: PublicClient,
): Promise<TokenValidationResult> {
	const token0Address: Address = await publicClient.readContract({
		address: bammAddress,
		abi: BAMM_ABI,
		functionName: "token0",
		args: [],
	});

	const token1Address: Address = await publicClient.readContract({
		address: bammAddress,
		abi: BAMM_ABI,
		functionName: "token1",
		args: [],
	});

	const normalizedToken = tokenAddress.toLowerCase();
	const normalizedToken0 = token0Address.toLowerCase();
	const normalizedToken1 = token1Address.toLowerCase();

	const isToken0 = normalizedToken === normalizedToken0;
	const isToken1 = normalizedToken === normalizedToken1;

	if (!isToken0 && !isToken1) {
		throw new Error("Token does not match token0 or token1 in the BAMM");
	}

	return {
		isToken0,
		isToken1,
		token0Address,
		token1Address,
	};
}
