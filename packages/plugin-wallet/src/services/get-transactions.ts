import {
	GoldRushClient,
	type ChainName,
	type GoldRushResponse,
	type MultiChainMultiAddressTransactionsResponse,
	type MultiChainTransaction,
} from "@covalenthq/client-sdk";
import dedent from "dedent";
import { elizaLogger } from "@elizaos/core";
import formatNumber, { formatWeiToNumber } from "../lib/format-number";

export interface GetTransactionsParams {
	chain: ChainName;
	address: string;
	limit?: number;
}

export class GetTransactionsService {
	private client: GoldRushClient;

	constructor(apiKey: string) {
		this.client = new GoldRushClient(apiKey, {
			debug: false,
			enableRetry: true,
		});
	}

	async getTransactions({
		chain,
		address,
		limit = 10,
	}: GetTransactionsParams): Promise<MultiChainTransaction[]> {
		try {
			if (!address) {
				throw new Error("No wallet address provided");
			}

			elizaLogger.info("🔍 Fetching transactions", { chain, address });

			// Get transactions for the wallet address
			const response: GoldRushResponse<MultiChainMultiAddressTransactionsResponse> =
				await this.client.AllChainsService.getMultiChainMultiAddressTransactions(
					{
						chains: [chain],
						addresses: [address],
						limit,
					},
				);

			if (response.error) {
				throw new Error(`API error: ${response.error_message}`);
			}

			return response.data.items;
		} catch (error) {
			elizaLogger.error("❌ Error fetching transactions", { error });
			throw new Error(`Failed to fetch transactions: ${error.message}`);
		}
	}

	formatTransactions(transactions: MultiChainTransaction[], chain: string) {
		if (transactions.length === 0) {
			return `📊 No transactions found for the address on ${chain}`;
		}

		const formattedTransactions = transactions
			.map((tx: MultiChainTransaction) => {
				// Format date
				const txDate = new Date(tx.block_signed_at).toLocaleString();

				// Determine transaction type
				const txType = tx.successful ? "✅" : "❌";

				// Format value if available
				const valueDisplay = tx.value
					? `${formatWeiToNumber(tx.value)} ${tx.value_quote ? `($${formatNumber(Number(tx.value_quote))})` : ""}`
					: "N/A";

				// Format gas information more comprehensively
				let gasInfo = "N/A";
				if (tx.gas_spent) {
					gasInfo = `${formatNumber(Number(tx.gas_spent))} units`;

					// Add gas price if available
					if (tx.gas_price) {
						const gasPriceInGwei = Number(tx.gas_price) / 1e9; // Convert wei to gwei
						gasInfo += ` @ ${gasPriceInGwei} gwei`;
					}

					// Calculate and show total gas cost if both gas_spent and gas_price are available
					if (tx.gas_spent && tx.gas_price) {
						const totalGasCost = BigInt(tx.gas_spent) * BigInt(tx.gas_price);
						gasInfo += ` (${formatWeiToNumber(totalGasCost)} total)`;
					}
				}

				return dedent`
          ${txType} *Transaction on ${txDate}*
          📝 Hash: \`${tx.tx_hash}\`
          💸 Value: ${valueDisplay}
          🔄 From: \`${tx.from_address}\`
          ➡️ To: \`${tx.to_address}\`
          🧾 Gas: ${gasInfo}
        `;
			})
			.join("\n\n");

		return dedent`
      📜 *Recent Transactions on ${chain}*
      🧮 *Total ${transactions.length} transactions*

      ${formattedTransactions}
    `;
	}
}
