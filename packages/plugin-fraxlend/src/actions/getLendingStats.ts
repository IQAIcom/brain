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

export async function getLendingStats() {
	try {
		const data = await client.request(LENDING_PAIRS_QUERY);
		return {
			success: true,
			data: data.pairs.map((pair) => ({
				symbol: pair.symbol,
				assetSymbol: pair.asset.symbol,
				apr: calculateApr(pair.dailyHistory[0].interestPerSecond as string),
				utilization: pair.dailyHistory[0].utilization,
				totalSupply: pair.dailyHistory[0].totalAssetAmount,
			})),
		};
	} catch (error) {
		return {
			success: false,
			error: `Failed to fetch lending stats: ${error.message}`,
		};
	}
}

function calculateApr(interestPerSecond: string): number {
	// Convert interest per second to a number
	const interestRate = Number(interestPerSecond);

	// Calculate seconds in a year
	const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

	// Convert to APR percentage
	const apr = interestRate * SECONDS_PER_YEAR * 100;

	// Return with 2 decimal places
	return Number(apr.toFixed(2));
}
