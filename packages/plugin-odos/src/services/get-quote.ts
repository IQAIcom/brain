import { formatUnits } from "viem";
import dedent from "dedent";

interface QuoteResponse {
	inTokens: string[];
	outTokens: string[];
	inAmounts: string[];
	outAmounts: string[];
	gasEstimate: number;
	dataGasEstimate: number;
	gweiPerGas: number;
	gasEstimateValue: number;
	inValues: number[];
	outValues: number[];
	netOutValue: number;
	priceImpact: number | null;
	percentDiff: number;
	pathId: string | null;
	blockNumber: number;
}

export class GetQuoteActionService {
	private readonly API_URL = "https://api.odos.xyz";

	async getQuote() {
		try {
			const response = await fetch(`${this.API_URL}/sor/quote/v2`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					chainId: 1, // Ethereum mainnet
					inputTokens: [
						{
							tokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
							amount: "1000000000000000000", // 1 WETH
						},
					],
					outputTokens: [
						{
							tokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
							proportion: 1,
						},
					],
					slippageLimitPercent: 0.3,
					userAddr: "0x0000000000000000000000000000000000000000", // Replace with actual user address
					referralCode: 0,
					disableRFQs: true,
					compact: true,
				}),
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch quote: ${response.statusText}`);
			}

			return (await response.json()) as QuoteResponse;
		} catch (error) {
			throw new Error(`Failed to fetch quote: ${error.message}`);
		}
	}

	format(quote: QuoteResponse) {
		const formattedQuote = dedent`
			💱 Quote Details
			- Input: ${formatUnits(BigInt(quote.inAmounts[0]), 18)} ${quote.inTokens[0]}
			- Output: ${formatUnits(BigInt(quote.outAmounts[0]), 18)} ${quote.outTokens[0]}
			- Price Impact: ${quote.priceImpact ? `${quote.priceImpact.toFixed(2)}%` : "N/A"}
			- Gas Estimate: ${quote.gasEstimate} (${quote.gasEstimateValue.toFixed(2)} USD)
			- Net Output Value: $${quote.netOutValue.toFixed(2)}
		`;

		return formattedQuote;
	}
}
