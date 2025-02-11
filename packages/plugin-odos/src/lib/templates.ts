import { CHAIN_IDS } from "./constants";
export const EXCHANGE_TEMPLATE = `Respond with a JSON object containing exchange information for odos swaps.
Extract the exchange details from the most recent message. If required information is missing, respond with an error.

The response must include:
- fromToken: The token address to exchange from
- toToken: The token addressto exchange to
- chain: The chain id of the chain to exchange on
- amount: The number of tokens to exchange in bigint

## Chain Ids
    ${Object.entries(CHAIN_IDS)
        .map(([chainName, chainId]) => `${chainName}: ${chainId}`)
        .join("\n")}

Example response:
\`\`\`json
{
    "fromToken": "0x1234567890123456789012345678901234567890",
    "toToken": "0x1234567890123456789012345678901234567891",
    "chain": "1",
    "amount": "1000000000000000000"
}
\`\`\`
{{recentMessages}}
Extract the exchange information from the most recent message.
Respond with a JSON markdown block containing both fromToken, toToken, chain and amount.`;