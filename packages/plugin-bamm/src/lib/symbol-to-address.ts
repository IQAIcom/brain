import type { Address } from "viem";

export async function getTokenAddressFromSymbol(
	symbol: string,
): Promise<Address> {
	const response = await fetch("https://api.frax.finance/v2/fraxswap/pools");
	if (!response.ok) {
		throw new Error("Failed to fetch token data");
	}
	const data = await response.json();
	// Look through the pools data to find the matching symbol and return the address
	const lowerSymbol = symbol.toLowerCase();
	for (const pool of data.pools) {
		if (pool.token0Symbol.toLowerCase() === lowerSymbol) {
			return pool.token0Address;
		}
		if (pool.token1Symbol.toLowerCase() === lowerSymbol) {
			return pool.token1Address;
		}
	}
	throw new Error(`Token address with symbol ${symbol} not found.`);
}
