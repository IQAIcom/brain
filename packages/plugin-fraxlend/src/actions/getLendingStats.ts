import { gql, GraphQLClient } from "graphql-request";

const LENDING_PAIRS_QUERY = gql`
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
`;

export async function getLendingStats() {
	const client = new GraphQLClient(
		"https://api.frax.finance/graphql/fraxtal/fraxlend",
	);

	try {
		const data = await client.request<any>(LENDING_PAIRS_QUERY);
		return {
			success: true,
			data: data.pairs.map((pair) => ({
				symbol: pair.symbol,
				assetSymbol: pair.asset.symbol,
				apr: calculateApr(pair.dailyHistory[0].interestPerSecond),
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
