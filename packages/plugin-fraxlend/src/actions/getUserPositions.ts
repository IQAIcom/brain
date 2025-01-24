import { graphql } from "gql.tada";
import { client } from "../lib/graphql";

const USER_POSITIONS_QUERY = graphql(`
  query GetUserPositions($userAddress: String!) {
    positions(where: {user: $userAddress}) {
      pair {
        symbol
        asset {
          symbol
        }
      }
      lentAssetShare
      depositedCollateralAmount
      dailyHistory(first: 1, orderBy: timestamp, orderDirection: desc) {
        lentAssetValue
        lendProfitTaken
        timestamp
      }
    }
  }
`);

export async function getUserPositions(userAddress: string) {
	try {
		const data = await client.request(USER_POSITIONS_QUERY, {
			userAddress,
		});
		return {
			success: true,
			data: data.positions.map((position) => ({
				symbol: position.pair.symbol,
				assetSymbol: position.pair.asset.symbol,
				lentAmount: position.lentAssetShare,
				collateralAmount: position.depositedCollateralAmount,
				value: position.dailyHistory[0]?.lentAssetValue || "0",
				profit: position.dailyHistory[0]?.lendProfitTaken || "0",
			})),
		};
	} catch (error) {
		return {
			success: false,
			error: `Failed to fetch user positions: ${error.message}`,
		};
	}
}
