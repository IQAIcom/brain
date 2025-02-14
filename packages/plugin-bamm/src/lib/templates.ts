export const LEND_TEMPLATE = `Respond with a JSON object containing lending information.
Extract the lending details from all recent messages.

The response must include:
- poolAddress: The BAMM pool address
- amount: The amount to lend (in ether values)
- error: An error message if valid poolAddress or amount cannot be determined (optional)

Example response:
\`\`\`json
{
    "poolAddress": "0x1234567890123456789012345678901234567890",
    "amount": "1000"
}
\`\`\`
\`\`\`json
{
    "poolAddress": "",
    "amount": "",
    "error": "No pool address found in context"
}
\`\`\`

{{recentMessages}}
Extract the lending information from all recent messages.
Respond with a JSON markdown block containing poolAddress and amount.`;

export const BORROW_TEMPLATE = `Respond with a JSON object containing borrowing information.
Extract the borrowing details from all recent messages.

The response must include:
- poolAddress: The BAMM pool address
- amount: The amount to borrow (in ether values)
- collateralAmount: The amount of collateral to provide (in ether values)
- error: An error message if required parameters cannot be determined (optional)

Example response:
\`\`\`json
{
    "poolAddress": "0x1234567890123456789012345678901234567890",
    "amount": "1000",
    "collateralAmount": "500"
}
\`\`\`
\`\`\`json
{
    "poolAddress": "",
    "amount": "",
    "collateralAmount": "",
    "error": "Missing pool address and amounts in context"
}
\`\`\`

{{recentMessages}}
Extract the borrowing information from all recent messages.
Respond with a JSON markdown block containing poolAddress, amount and collateralAmount.`;
