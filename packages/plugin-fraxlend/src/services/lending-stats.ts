import { graphql } from "gql.tada";
import { client } from "../lib/graphql";
import dedent from "dedent";

const LENDING_PAIRS_QUERY = graphql(`
  query GetLendingPairs {
    pairs(first: 100) {
      id
      name
      symbol
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
				symbol: pair.symbol,
				assetSymbol: pair.asset.symbol,
				apr: this.calculateApr(
					pair.dailyHistory[0].interestPerSecond as string,
				),
				utilization: pair.dailyHistory[0].utilization,
				totalSupply: pair.dailyHistory[0].totalAssetAmount,
			}));
		} catch (error) {
			throw new Error(`Failed to fetch lending stats: ${error.message}`);
		}
	}

	private calculateApr(interestPerSecond: string): number {
		const interestRate = Number(interestPerSecond);
		const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
		const apr = interestRate * SECONDS_PER_YEAR * 100;
		return Number(apr.toFixed(2));
	}

	formatStats(
		stats: Array<{
			symbol: string;
			assetSymbol: string;
			apr: number;
			utilization: unknown;
			totalSupply: unknown;
		}>,
	) {
		const formattedStats = stats
			.map(
				(pool) =>
					dedent`
						🏦 ${pool.symbol} (${pool.assetSymbol})
						- APR: ${pool.apr}%
						- Utilization: ${Number(pool.utilization).toFixed(2)}%
						- Total Supply: ${Number(pool.totalSupply).toFixed(2)} ${pool.assetSymbol}
					`,
			)
			.join("\n");

		return `📊 *Current Lending Statistics*\n\n${formattedStats}`;
	}
}
