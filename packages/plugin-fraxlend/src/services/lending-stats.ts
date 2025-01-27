import { graphql } from "gql.tada";
import { client } from "../lib/graphql";

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
			return {
				success: true,
				data: data.pairs.map((pair) => ({
					symbol: pair.symbol,
					assetSymbol: pair.asset.symbol,
					apr: this.calculateApr(
						pair.dailyHistory[0].interestPerSecond as string,
					),
					utilization: pair.dailyHistory[0].utilization,
					totalSupply: pair.dailyHistory[0].totalAssetAmount,
				})),
			};
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
}
