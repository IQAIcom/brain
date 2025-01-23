import { gql } from "graphql-request";

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
		const data = await client.request(LENDING_PAIRS_QUERY);
		return {
			success: true,
			data: data.pairs.map((pair) => ({
				symbol: pair.symbol,
				assetSymbol: pair.asset.symbol,
				apr: calculateAPR(pair.dailyHistory[0].interestPerSecond),
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
