export const GET_AGENT_STATS_TEMPLATE = `Respond with a JSON object containing agent address for stats lookup.
Extract the agent address from the most recent message. If required information is missing, respond with an error.

The response must include:
- agentAddress: The agent's contract address

Example response:
\`\`\`json
{
    "agentAddress": "0x1234567890123456789012345678901234567890"
}
\`\`\`
{{recentMessages}}
Extract the agent address from the most recent message.
Respond with a JSON markdown block containing the agentAddress.`;

export const GET_HOLDINGS_TEMPLATE = `Respond with a JSON object containing wallet address for holdings lookup.
Extract the wallet address from the most recent message. If required information is missing, respond with an error.

The response must include:
- walletAddress: The wallet address to check holdings for

Example response:
\`\`\`json
{
    "walletAddress": "0x1234567890123456789012345678901234567890"
}
\`\`\`
{{recentMessages}}
Extract the wallet address from the most recent message.
Respond with a JSON markdown block containing the walletAddress.`;

export const BUY_AGENT_TEMPLATE = `Respond with a JSON object containing agent purchase information.
Extract the purchase details from the most recent message. If required information is missing, respond with an error.

The response must include:
- agentAddress: The agent's contract address
- amount: The amount to buy in base units

Example response:
\`\`\`json
{
    "agentAddress": "0x1234567890123456789012345678901234567890",
    "amount": "1000000000000000000"
}
\`\`\`
{{recentMessages}}
Extract the purchase information from the most recent message.
Respond with a JSON markdown block containing both agentAddress and amount.`;

export const SELL_AGENT_TEMPLATE = `Respond with a JSON object containing agent sell information.
Extract the sell details from the most recent message. If required information is missing, respond with an error.

The response must include:
- agentAddress: The agent's contract address
- amount: The amount to sell in base units

Example response:
\`\`\`json
{
    "agentAddress": "0x1234567890123456789012345678901234567890",
    "amount": "1000000000000000000"
}
\`\`\`
{{recentMessages}}
Extract the sell information from the most recent message.
Respond with a JSON markdown block containing both agentAddress and amount.`;
