import { gql } from "graphql-request";

const USER_POSITIONS_QUERY = gql`
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
`;

export async function getUserPositions(userAddress: string) {
	const client = new GraphQLClient(
		"https://api.frax.finance/graphql/fraxtal/fraxlend",
	);

	try {
		const data = await client.request(USER_POSITIONS_QUERY, { userAddress });
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
