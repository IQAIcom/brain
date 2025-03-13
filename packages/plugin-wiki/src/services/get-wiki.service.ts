import type { IAgentRuntime, Memory, State } from "@elizaos/core";
import dedent from "dedent";
import { InputParserService } from "./input-parser";
import { EXCHANGE_TEMPLATE } from "../lib/templates";
import { Wiki, type Wiki as WikiType } from "@everipedia/iq-utils";

export class GetWikiService {
	private readonly API_URL = "https://graph.everipedia.org/graphql";

	async execute(runtime: IAgentRuntime, message: Memory, state: State) {
		const inputParser = new InputParserService();

		const parsedOutput = await inputParser.parseInputs({
			runtime,
			message,
			state,
			template: EXCHANGE_TEMPLATE,
		});

		if ("error" in parsedOutput) {
			return new Error(parsedOutput.error);
		}

		const query = {
			query: `
                {
                    wiki(id: "bitcoin") {
                    id
                    ipfs
                    title
                    author
                    events
                    created
                    updated
                    content
                    summary
                    founderWikis
                    speakerWikis
                    blockchainWikis
                    transactionHash
                    }
                }
                `,
		};

		try {
			const response = await fetch(this.API_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(query),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const data = await response.json();

			if (!response.ok) {
				throw new Error(`Failed to fetch wiki: ${response.statusText}`);
			}

			return data as WikiType;
		} catch (error) {
			throw new Error(`Failed to fetch wiki: ${error.message}`);
		}
	}

	format(quote: WikiType) {
		const formattedWiki = dedent`
			📜 WIki Details
		`;
		// const formattedQuote = dedent`
		// 	💱 Quote Details
		// 	- Input: ${formatUnits(BigInt(quote.inAmounts[0]), 18)} ${quote.inTokens[0]}
		// 	- Output: ${formatUnits(BigInt(quote.outAmounts[0]), 18)} ${quote.outTokens[0]}
		// 	- Price Impact: ${
		//         quote.priceImpact ? `${quote.priceImpact.toFixed(2)}%` : 'N/A'
		//     }
		// 	- Gas Estimate: ${quote.gasEstimate} (${quote.gasEstimateValue.toFixed(2)} USD)
		// 	- Net Output Value: $${quote.netOutValue.toFixed(2)}
		// `

		return formattedWiki;
	}
}
