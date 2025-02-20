import dedent from "dedent";
import { graphql } from "gql.tada";
import { formatEther } from "viem";
import { client } from "../lib/graphql";
import type { WalletService } from "./wallet";

const PAIR_ADDRESS_QUERY = graphql(`
	query fraxlendPairs($where: Pair_filter) {
		pairs(where: $where) {
			id
			symbol
			asset {
				symbol
				decimals
			}
			collateral {
				symbol
				decimals
			}
			dailyHistory(first: 1, orderBy: timestamp, orderDirection: desc) {
				interestPerSecond
			}
			maxLTV
			liquidationFee
			cleanLiquidationFee
			dirtyLiquidationFee
			protocolLiquidationFee
			maturity
			pauseStatus
			pauseInterestStatus
			pauseLiquidateStatus
			pauseRepayStatus
			pauseWithdrawStatus
		}
	}
`);

export class PairAddressService {
	private walletService: WalletService;

	constructor(walletService: WalletService) {
		this.walletService = walletService;
	}

	async getPairAddress(params: {
		assetSymbol?: string;
		collateralSymbol?: string;
		sortByApr?: "highest" | "lowest";
	}) {
		try {
			const where: Record<string, any> = {};

			if (params.assetSymbol) {
				where.asset_ = { symbol_contains: params.assetSymbol.toUpperCase() };
			}

			if (params.collateralSymbol) {
				where.collateral_ = {
					symbol_contains: params.collateralSymbol.toUpperCase(),
				};
			}

			const data = await client.request(PAIR_ADDRESS_QUERY, { where });

			const pairs = data.pairs.map((pair) => ({
				address: pair.id,
				symbol: pair.symbol,
				assetSymbol: pair.asset.symbol,
				collateralSymbol: pair.collateral.symbol,
				apr: this.calculateApr(
					pair.dailyHistory[0].interestPerSecond as string,
				),
				maxLTV: pair.maxLTV,
				liquidationFee: pair.liquidationFee,
				status: {
					paused: pair.pauseStatus,
					pausedInterest: pair.pauseInterestStatus,
					pausedLiquidate: pair.pauseLiquidateStatus,
					pausedRepay: pair.pauseRepayStatus,
					pausedWithdraw: pair.pauseWithdrawStatus,
				},
			}));

			if (params.sortByApr) {
				pairs.sort((a, b) =>
					params.sortByApr === "highest" ? b.apr - a.apr : a.apr - b.apr,
				);
			}

			return pairs;
		} catch (error) {
			throw new Error(`Failed to fetch pair address: ${error.message}`);
		}
	}

	private calculateApr(interestPerSecond: string): number {
		const interestRate = Number(formatEther(BigInt(interestPerSecond)));
		const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
		const apr = interestRate * SECONDS_PER_YEAR * 100;
		return Number(apr.toFixed(2));
	}

	formatPairAddresses(
		pairs: Awaited<ReturnType<PairAddressService["getPairAddress"]>>,
	) {
		if (pairs.length === 0) {
			return "🔍 No Pairs Found";
		}

		const formattedPairs = pairs
			.map((pair) => {
				return dedent`
          🔸 ${pair.symbol}
          - Address: ${pair.address}
          - Asset: ${pair.assetSymbol}
          - Collateral: ${pair.collateralSymbol}
          - Current APR: ${pair.apr}%
          - Max LTV: ${pair.maxLTV}%
          - Liquidation Fee: ${pair.liquidationFee}%
          ${pair.status.paused ? "⚠️ Pool is currently paused" : ""}
        `;
			})
			.join("\n\n");

		return `📍 *Available Pairs*\n\n${formattedPairs}`;
	}
}
