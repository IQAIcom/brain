import {
	type BalancesResponse,
	type ChainName,
	type GetTokenBalancesForWalletAddressQueryParamOpts,
	GoldRushClient,
	type GoldRushResponse,
	type BalanceItem,
} from "@covalenthq/client-sdk";
import dedent from "dedent";
import { elizaLogger } from "@elizaos/core";
import formatNumber, { formatWeiToNumber } from "../lib/format-number";

export interface GetHoldingsParams {
	chain: ChainName;
	address: string;
}

export class GetHoldingsService {
	private client: GoldRushClient;

	constructor(apiKey: string) {
		this.client = new GoldRushClient(apiKey, {
			debug: true,
			enableRetry: true,
		});
	}

	async getHoldings({ chain, address }: GetHoldingsParams) {
		try {
			const walletAddress = address;

			if (!walletAddress) {
				throw new Error("No wallet address provided");
			}

			elizaLogger.info("🔍 Fetching holdings", { chain, walletAddress });

			const options: GetTokenBalancesForWalletAddressQueryParamOpts = {
				quoteCurrency: "USD",
				nft: false,
				noSpam: true,
			};

			// Get token balances for the wallet address
			const response: GoldRushResponse<BalancesResponse> =
				await this.client.BalanceService.getTokenBalancesForWalletAddress(
					chain,
					walletAddress,
					options,
				);

			if (response.error) {
				throw new Error(`API error: ${response.error_message}`);
			}

			return response.data;
		} catch (error) {
			elizaLogger.error("❌ Error fetching holdings", { error });
			throw new Error(`Failed to fetch holdings: ${error.message}`);
		}
	}

	formatHoldings(holdings: BalancesResponse, chain: string) {
		if (!holdings || !holdings.items || holdings.items.length === 0) {
			return `📊 No holdings found for the address on ${chain}`;
		}

		const formattedHoldings = holdings.items
			.map((token: BalanceItem) => {
				return dedent`
          💰 *${token.contract_display_name}* (${token.contract_ticker_symbol})
          💵 Value: ${token.pretty_quote_24h}
          🔢 Balance: ${formatWeiToNumber(token.balance)}
					📩 Address ${token.contract_address}
        `;
			})
			.join("\n\n\n");

		return dedent`
      🏦 *Wallet Holdings on ${chain}*
			🧮 *Total holdings: ${holdings.items.length}*

      ${formattedHoldings}

    `;
	}
}
