import { formatUnits } from "viem";
import dedent from "dedent";
import { EXCHANGE_TEMPLATE } from "../lib/templates";
import type { IAgentRuntime, Memory, State } from "@elizaos/core";
import { InputParserService } from "./input-parser";

export interface QuoteResponse {
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

	async execute(runtime: IAgentRuntime, message: Memory, state: State) {

		const inputParser = new InputParserService();
		const parsedOutput = await inputParser.parseInputs({
			runtime,
			message,
			state,
			template: EXCHANGE_TEMPLATE,
		});

		if('error' in parsedOutput){
			return new Error(parsedOutput.error);	
		}

		const { fromToken, toToken, chainId, amount } = parsedOutput

		try {
			const response = await fetch(`${this.API_URL}/sor/quote/v2`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					chainId,
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
					slippageLimitPercent: 0.3,
					referralCode: 0,
					disableRFQs: true,
					compact: true,
				})
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(`Failed to fetch quote: ${response.statusText}`);
			}

			return data as QuoteResponse;
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
