import { Address, formatUnits } from "viem";
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

	async execute(fromToken: Address, toToken: Address, chain: number, amount: string) {
		console.log("OBJECT: ", { fromToken, toToken, chain, amount })
		const response = await fetch(`${this.API_URL}/sor/quote/v2`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				chainId: chain,
				inputTokens: [
					{
						tokenAddress: fromToken,
						amount,
					},
				],
				outputTokens: [
					{
						proportion: 1,
						tokenAddress: toToken
					}
				],
				userAddr: "0x0be79efa3E4652aba1797ae69C4625472d69FB2B",
				slippageLimitPercent: 0.3,
				referralCode: 0,
				disableRFQs: true,
				compact: true,
			})
		})

		const data = await response.json()
		console.log("response: ", response)
		console.log("data: ", data)

		// try {
		// 	const response = await fetch(`${this.API_URL}/sor/quote/v2`, {
		// 		method: "POST",
		// 		headers: {
		// 			"Content-Type": "application/json",
		// 		},
		// 		body: JSON.stringify({
		// 			chainId: chain,
		// 			inputTokens: [
		// 				{
		// 					tokenAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
		// 					amount: "189000000",
		// 				},
		// 			],
		// 			outputTokens: [
		// 				{
		// 					tokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
		// 					proportion: 1,
		// 				},
		// 			],
		// 			slippageLimitPercent: 0.3,
		// 			userAddr: "0x0000000000000000000000000000000000000000", // Replace with actual user address
		// 			referralCode: 0,
		// 			disableRFQs: true,
		// 			compact: true,
		// 		}),
		// 	});

		// 	if (!response.ok) {
		// 		throw new Error(`Failed to fetch quote: ${response.statusText}`);
		// 	}

		// 	return (await response.json()) as QuoteResponse;
		// } catch (error) {
		// 	throw new Error(`Failed to fetch quote: ${error.message}`);
		// }
		return data
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
