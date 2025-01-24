import { graphql } from "gql.tada";
import { client } from "../lib/graphql";

const USER_POSITIONS_QUERY = graphql(`
  query fraxlendUsers($user: User_filter) {
    users(first: 1000, where: $user) {
      id
      positions {
        borrowedAssetShare
        lentAssetShare
        depositedCollateralAmount
        pair {
          symbol
          asset {
            symbol
            decimals
          }
          collateral {
            symbol
            decimals
          }
        }
        dailyHistory(first: 1, orderBy: timestamp, orderDirection: desc) {
          lentAssetValue
          lendProfitTaken
          borrowedAssetValue
          depositedCollateralValue
          timestamp
        }
      }
    }
  }
`);

export async function getUserPositions(userAddress: string) {
	try {
		const data = await client.request(USER_POSITIONS_QUERY, {
			user: {
				id: userAddress.toLowerCase(),
			},
		});

		return {
			success: true,
			data: data.users[0]?.positions.map((position) => ({
				symbol: position.pair.symbol,
				assetSymbol: position.pair.asset.symbol,
				collateralSymbol: position.pair.collateral.symbol,
				lentAmount: position.lentAssetShare,
				borrowedAmount: position.borrowedAssetShare,
				collateralAmount: position.depositedCollateralAmount,
				value: position.dailyHistory[0]?.lentAssetValue || "0",
				borrowValue: position.dailyHistory[0]?.borrowedAssetValue || "0",
				collateralValue:
					position.dailyHistory[0]?.depositedCollateralValue || "0",
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
