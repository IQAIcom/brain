import { graphql } from "gql.tada";
import { client } from "../lib/graphql";
import type { WalletService } from "./wallet";
import dedent from "dedent";

const AGENT_POSITIONS_QUERY = graphql(`
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

export class AgentPositionsService {
	private walletService: WalletService;

	constructor(walletService: WalletService) {
		this.walletService = walletService;
	}

	async getPositions() {
		const walletClient = this.walletService.getWalletClient();
		const userAddress = walletClient.account.address;
		try {
			const data = await client.request(AGENT_POSITIONS_QUERY, {
				user: {
					id: userAddress.toLowerCase(),
				},
			});

			return data.users[0]?.positions.map((position) => ({
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
			}));
		} catch (error) {
			throw new Error(`Failed to fetch agent positions: ${error.message}`);
		}
	}

	formatPositions(
		positions: Awaited<ReturnType<AgentPositionsService["getPositions"]>>,
	) {
		if (positions.length === 0) {
			return "📊 *No Active Positions Found*";
		}

		const formattedPositions = positions
			.map(
				(pos) => dedent`
			🔹 ${pos.symbol}
			• Lent: ${Number(pos.lentAmount).toFixed(2)} ${pos.assetSymbol} (Value: $${Number(pos.value).toFixed(2)})
			• Borrowed: ${Number(pos.borrowedAmount).toFixed(2)} ${pos.assetSymbol} (Value: $${Number(pos.borrowValue).toFixed(2)})
			• Collateral: ${Number(pos.collateralAmount).toFixed(2)} ${pos.collateralSymbol} (Value: $${Number(pos.collateralValue).toFixed(2)})
			• Profit: $${Number(pos.profit).toFixed(2)}
		`,
			)
			.join("\n\n");

		return `📊 *Your Active Positions*\n\n${formattedPositions}`;
	}
}
