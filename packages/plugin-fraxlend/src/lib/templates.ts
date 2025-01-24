export const getDepositTemplate = `Respond with a JSON object containing deposit information for FraxLend.
Extract the deposit details from the most recent message. If required information is missing, respond with an error.

The response must include:
- pairAddress: The FraxLend pool address
- amount: The deposit amount in base units

Example response:
\`\`\`json
{
    "pairAddress": "0x1234567890123456789012345678901234567890",
    "amount": "1000000000000000000"
}
\`\`\`
{{recentMessages}}
Extract the deposit information from the most recent message.
Respond with a JSON markdown block containing both pairAddress and amount.`;
