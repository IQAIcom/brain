import { getAllValidChainNames } from "./chain-utils";

const validChainNames = getAllValidChainNames().join(", ");

export const GET_HOLDINGS_TEMPLATE = `Respond with a JSON object containing chain and wallet address information.
Extract the chain name or chain ID and wallet address (if provided) from the most recent message.

Valid chain names include: ${validChainNames}

The chain name must exactly match one of the valid chain names listed above. Do not use alternatives or variations.
try to match the extracted chain name the most relevant chain name in the valid chain names list.
for example if the extracted chain name is fraxtal, the response should be fraxtal-mainnet.

The response must include:
- chain: The blockchain chain name exactly as listed above (e.g., "eth-mainnet", "fraxtal-mainnet"). this is optional and default to fraxtal-mainnet if not provided.
- address: The wallet address to check (optional)
- error: An error message if a valid chain/address cannot be determined from the given message (optional)
NOTE: the error should only be thrown if the given message contains an invalid chain name or address. these are optional and user is not required to provide a chain or address.
NOTE: if address is not provided, do not return the address field. same applies to the chain field.
Example response:
\`\`\`json
{
    "chain": "fraxtal-mainnet",
    "address": "0x1234567890123456789012345678901234567890"
}
\`\`\`

{{recentMessages}}
Extract the chain name and wallet address (if provided) from the most recent message.
Respond with a JSON markdown block containing the chain and address.`;
