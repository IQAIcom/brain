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

export const SWAP_TEMPLATE = `Respond with a JSON object containing swap information for ATP agents.
Extract the swap details from the most recent message. If required information is missing, respond with an error.

The response must include:
- agentAddress: The agent's contract address
- amount: The amount to swap in base units
- action: The swap action type ("buy" or "sell")

Example response:
\`\`\`json
{
    "agentAddress": "0x1234567890123456789012345678901234567890",
    "amount": "1000000000000000000",
    "action": "buy"
}
\`\`\`
{{recentMessages}}
Extract the swap information from the most recent message.
Respond with a JSON markdown block containing agentAddress, amount and action.`;
