export const GET_AGENT_STATS_TEMPLATE = `Respond with a JSON object containing agent address for stats lookup.
Extract the agent address from the most recent message. You can also search all given messages if necessary.
If required information is missing, respond with an error.

The response must include:
- tokenContract: The token contract address
- error: An error message if a valid tokenContract cannot be determined (optional)

Example response:
\`\`\`json
{
    "tokenContract": "0x1234567890123456789012345678901234567890"
}
\`\`\`
\`\`\`json
{
    "tokenContract": "",
    "error": "No token contract found in context"
}
\`\`\`
{{recentMessages}}
Extract the agent address from the most recent message.
Respond with a JSON markdown block containing the tokenContract.`;


export const BUY_AGENT_TEMPLATE = `Respond with a JSON object containing purchase information.
Extract the purchase details from all recent messages, including previously shown holdings or stats.

Amount must be specified in base tokens.
For token contract: First try to find it in recent messages (holdings, stats), if not found, request it explicitly.

The response must include:
- tokenContract: The token contract address
- amount: The amount to purchase in base tokens (in ether values)
- error: An error message if a valid tokenContract or amount cannot be determined (optional)

Example response:
\`\`\`json
{
    "tokenContract": "0x1234567890123456789012345678901234567890",
    "amount": "50000",
}
\`\`\`
\`\`\`json
{
    "tokenContract": "",
    "amount": "10000",
    "error" : "No token contract found in context"
}
\`\`\`
\`\`\`json
{
    "tokenContract": "0x1234567890123456789012345678901234567890",
    "amount": "",
    "error" : "No proper amount found in context"
}
\`\`\`

{{recentMessages}}
Extract the purchase information from all recent messages.
Respond with a JSON markdown block containing tokenContract and amount.`;

export const SELL_AGENT_TEMPLATE = `Respond with a JSON object containing agent sell information.
Extract the sell details from all recent messages, including previously shown holdings or stats.

For token contract: First try to find it in recent messages (holdings, stats), if not found, request it explicitly.

The response must include:
- tokenContract: The agent's token contract address
- amount: The amount of base tokens to sell (in ether values)
- error: An error message if a valid tokenContract or amount cannot be determined (optional)

Example response:
\`\`\`json
{
    "tokenContract": "0x1234567890123456789012345678901234567890",
    "amount": "50000",
}
\`\`\`
\`\`\`json
{
    "tokenContract": "",
    "amount": "100000",
    "error" : "No token contract found in context"
}
\`\`\`
\`\`\`json
{
    "tokenContract": "0x1234567890123456789012345678901234567890",
    "amount": "",
    "error" : "No proper amount found in context"
}
\`\`\`

If token contract cannot be found in context, respond with:
"Please provide the token contract address for the agent you want to sell"

{{recentMessages}}
Extract the sell information from all recent messages.
Respond with a JSON markdown block containing tokenContract and amount.`;
