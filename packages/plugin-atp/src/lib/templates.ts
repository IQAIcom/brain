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

export const GET_AGENTS_TEMPLATE = `Respond with a JSON object containing optional sort and limit parameters for agent listing.
Extract the parameters from the most recent message.

The response must include:
- sort: Optional sorting parameter ("mcap", "holders", or "inferences")
- limit: Optional number of agents to return
- error: An error message if parameters are invalid (optional)

NOTE: If no parameters are provided, return empty response with no error.

Example response:
\`\`\`json
{
    "sort": "mcap",
    "limit": 5
}
\`\`\`
\`\`\`json
{
    "sort": "holders"
}
\`\`\`
\`\`\`json
{
    "limit": 10
}
\`\`\`
\`\`\`json
{
    "error": "Invalid sort parameter. Use mcap, holders, or inferences"
}
\`\`\`

{{recentMessages}}
Extract the parameters from the most recent message.
Respond with a JSON markdown block containing sort and/or limit.`;

export const GET_AGENT_LOGS_TEMPLATE = `Respond with a JSON object containing parameters for agent logs lookup.
Extract the agent address from the most recent message. You can also search all given messages if necessary.
If required information is missing, respond with an error.

The response must include:
- agentTokenContract: The token contract address
- page: Optional page number
- limit: Optional number of logs to return per page (max is 100)
- error: An error message if a valid agentTokenContract cannot be determined (optional)

Example response:
\`\`\`json
{
    "agentTokenContract": "0x1234567890123456789012345678901234567890",
}
\`\`\`
\`\`\`json
{
    "error": "No token contract found in context"
}
\`\`\`
{{recentMessages}}
Extract the agent address and pagination details from the most recent message.
Respond with a JSON markdown block containing the parameters.`;

export const ADD_AGENT_LOG_TEMPLATE = `Respond with a JSON object containing parameters for adding an agent log.
Extract the details from the most recent message.

The response must include:
- agentTokenContract: The token contract address
- content: The log content
- txHash: Optional transaction hash
- error: An error message if required parameters are missing (optional)

Example response:
\`\`\`json
{
    "agentTokenContract": "0x1234567890123456789012345678901234567890",
    "content": "This is a log message",
}
\`\`\`
\`\`\`json
{
    "agentTokenContract": "0x1234567890123456789012345678901234567890",
    "content": "Weekly yield distribution done. check txn",
    "txHash": "0x1234567890123456789012345678901234567890"
}
\`\`\`
\`\`\`json
{
    "error": "No token contract found in context"
}
\`\`\`
\`\`\`json
{
    "error": "No log content provided"
}
\`\`\`
{{recentMessages}}
Extract the log details from the most recent message.
Respond with a JSON markdown block containing the parameters.`;
