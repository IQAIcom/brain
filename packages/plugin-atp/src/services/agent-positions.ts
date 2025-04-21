import dedent from "dedent";
import { API_URLS, DEV_API_URLS } from "../constants";
import formatNumber from "../lib/format-number";
import type { AgentPositionsResponse } from "../types";
import type { WalletService } from "./wallet";

export class AgentPositionsService {
	private walletService: WalletService;

	constructor(walletService: WalletService) {
		this.walletService = walletService;
	}

	async getPositions(): Promise<AgentPositionsResponse> {
		const walletClient = this.walletService.getWalletClient();
		const userAddress = walletClient.account.address;
		try {
			const url = new URL(
				process.env.ATP_USE_DEV ? DEV_API_URLS.HOLDINGS : API_URLS.HOLDINGS,
			);
			url.searchParams.append("address", userAddress);

			const response = await fetch(url.toString(), {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(
					`Failed to fetch agent positions: ${response.statusText}`,
				);
			}
			return (await response.json()) as AgentPositionsResponse;
		} catch (error) {
			throw new Error(`Failed to fetch agent positions: ${error.message}`);
		}
	}

	formatPositions(
		positions: Awaited<ReturnType<AgentPositionsService["getPositions"]>>,
	) {
		if (positions.holdings.length === 0) {
			return "📊 No Active Positions Found";
		}
		const formattedPositions = positions.holdings
			.map((pos) => {
				const tokenAmount = formatNumber(Number(pos.tokenAmount));
				const currentPriceInUsd = formatNumber(pos.currentPriceInUsd);

				return dedent`
				💰 ${pos.name}
				- Token Contract: ${pos.tokenContract}
				- Token Amount: ${tokenAmount}
				- Current Price: ${currentPriceInUsd} USD
			`;
			})
			.join("\n");

		return `📊 *Your Active Positions*\n\n${formattedPositions}`;
	}
}
