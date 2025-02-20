import dedent from "dedent";
import { graphql } from "gql.tada";
import { formatEther, formatUnits } from "viem";
import { client } from "../lib/graphql";

const LENDING_PAIRS_QUERY = graphql(`
  query GetLendingPairs {
    pairs(first: 100) {
      id
      name
      symbol
      address
      asset {
        symbol
        decimals
      }
      dailyHistory(first: 1, orderBy: timestamp, orderDirection: desc) {
        interestPerSecond
        utilization
        totalAssetAmount
        totalBorrowAmount
        timestamp
      }
    }
  }
`);

export class LendingStatsService {
	async getStats() {
		try {
			const data = await client.request(LENDING_PAIRS_QUERY);
			return data.pairs.map((pair) => ({
				address: pair.id,
				symbol: pair.symbol,
				assetSymbol: pair.asset.symbol,
				apr: this.calculateApr(
					pair.dailyHistory[0].interestPerSecond as string,
				),
				utilization: pair.dailyHistory[0].utilization,
				totalSupply: pair.dailyHistory[0].totalAssetAmount,
				decimals: pair.asset.decimals,
			}));
		} catch (error) {
			throw new Error(`Failed to fetch lending stats: ${error.message}`);
		}
	}

	private calculateApr(interestPerSecond: string): number {
		const interestRate = Number(formatEther(BigInt(interestPerSecond)));
		const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
		const apr = interestRate * SECONDS_PER_YEAR * 100;
		return Number(apr.toFixed(2));
	}

	formatStats(stats: Awaited<ReturnType<LendingStatsService["getStats"]>>) {
		if (stats.length === 0) {
			return dedent`
				📊 FraxLend Statistics

				No active lending pools found.
			`;
		}

		const formattedStats = stats
			.map((pool) => {
				const formattedSupply = Number(
					formatUnits(
						BigInt(pool.totalSupply as number),
						pool.decimals as number,
					),
				).toFixed(3);
				const formattedUtilization = (Number(pool.utilization) / 100).toFixed(
					2,
				);

				return dedent`
					🏦 ${pool.symbol} (${pool.assetSymbol})
					├ 🔗 Address: ${pool.address}
					├ 📈 APR: ${pool.apr}%
					├ 📊 Utilization: ${formattedUtilization}%
					└ 💰 Total Supply: ${formattedSupply} ${pool.assetSymbol}
				`;
			})
			.join("\n\n");

		return dedent`
			📊 FraxLend Pool Statistics
			═══════════════════════════

			${formattedStats}

			Last Updated: ${new Date().toLocaleString()}
		`;
	}
}
