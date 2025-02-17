import dedent from "dedent";
import type { WalletService } from "./wallet";
import { BAMM_ADDRESSES } from "../constants";
import { BAMM_FACTORY_ABI } from "../lib/bamm-factory.abi";
import type { Address } from "viem";
import formatNumber from "../lib/format-number";
import type { PoolStats } from "../types";

export class BammPoolsStatsService {
	// Frax API endpoint for all Fraxswap pools
	private endpoint = "https://api.frax.finance/v2/fraxswap/pools";

	constructor(private walletService: WalletService) {}

	/**
	 * Returns only the pools from the Frax API that are recognized as BAMM pools.
	 */
	async getPoolsStats(): Promise<PoolStats[]> {
		//TODO: decide a better way to do this
		// we can also get the pool stats by:
		// 1. Get the list of all BAMM addresses from the factory
		// 2. Loop through each BAMM contract address and call pair to get fraxswap pair and collect it
		// 3. simply get all the relevant data from the api

		const publicClient = this.walletService.getPublicClient();

		// 1. Fetch the full list of pools from the Frax API endpoint.
		const response = await fetch(this.endpoint);
		if (!response.ok) {
			throw new Error(`Failed to fetch pools: ${response.statusText}`);
		}
		const data = await response.json();
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const allPools: PoolStats[] = data.pools.map((pool: any) => ({
			...pool,
			bammAddress: pool.poolAddress,
			bammApr: 0,
			fraxswapApr: 0,
		}));

		// 2. Filter the pools by checking on-chain if they are BAMM pools.
		const filteredPools: PoolStats[] = [];
		for (const pool of allPools) {
			// Call pairToBamm on the BAMM factory using the pool's address (Fraxswap pair).
			const bammAddress: Address = await publicClient.readContract({
				address: BAMM_ADDRESSES.FACTORY,
				abi: BAMM_FACTORY_ABI,
				functionName: "pairToBamm",
				args: [pool.poolAddress as `0x${string}`],
			});

			// If pairToBamm returns the zero address, then there's no BAMM for this pool.
			if (
				bammAddress === "0x0000000000000000000000000000000000000000" ||
				!bammAddress
			) {
				continue;
			}

			// Now call isBamm with this address on the BAMM factory.
			const isBamm: boolean = await publicClient.readContract({
				address: BAMM_ADDRESSES.FACTORY,
				abi: BAMM_FACTORY_ABI,
				functionName: "isBamm",
				args: [bammAddress],
			});

			// If isBamm returns true, include this pool.
			if (isBamm) {
				pool.bammAddress = bammAddress;
				//TODO: verify if this is correct way of calculating APR
				pool.bammApr = pool.tvl > 0 ? (pool.fees24H / pool.tvl) * 365 * 100 : 0;
				pool.fraxswapApr =
					pool.tvl > 0
						? ((pool.volumeSwap24H * pool.feePercentage) / pool.tvl) * 365 * 100
						: 0;
				filteredPools.push(pool);
			}
		}

		// 3. Sort the filtered pools in descending order by TVL.
		filteredPools.sort((a, b) => b.tvl - a.tvl);

		return filteredPools;
	}

	/**
	 * Neatly formats the pool stats using dedent.
	 */
	formatPoolsStats(pools: PoolStats[]): string {
		if (pools.length === 0) {
			return "📊 No BAMM Pools Found";
		}

		const formattedStats = pools
			.map((pool) => {
				const poolName = `${pool.token0Symbol}/${pool.token1Symbol}`;
				return dedent`
          📊 Pool: ${poolName}
          - Pool Address: ${pool.poolAddress}
          - BAMM Address: ${pool.bammAddress}
          - BAMM APR: ${pool.bammApr > 0 ? `${formatNumber(pool.bammApr || 0)}%` : "N/A"}
          - Fraxswap APR: ${pool.fraxswapApr > 0 ? `${formatNumber(pool.fraxswapApr || 0)}%` : "N/A"}
          - TVL: $${formatNumber(pool.tvl || 0)}
          - ${pool.token0Symbol} Locked: ${formatNumber(pool.token0AmountLocked || 0)}
          - ${pool.token1Symbol} Locked: ${formatNumber(pool.token1AmountLocked || 0)}
        `;
			})
			.join("\n\n");

		return dedent`
      📊 *BAMM Pool Stats:*
      Total: ${pools.length}

      ${formattedStats}
    `;
	}
}
