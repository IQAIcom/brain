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
- pairAddress: The BAMM pool address
- borrowAmount: The amount to borrow (in ether values)
- collateralAmount: The amount of collateral to provide (in ether values)
- receiver: The address that will receive the borrowed assets
- error: An error message if required parameters cannot be determined (optional)

Example response:
\`\`\`json
{
    "pairAddress": "0x1234567890123456789012345678901234567890",
    "borrowAmount": "1000",
    "collateralAmount": "2000",
    "receiver": "0x1234567890123456789012345678901234567890"
}
\`\`\`

{{recentMessages}}
Extract the borrowing information from all recent messages.
Respond with a JSON markdown block containing pairAddress, borrowAmount, collateralAmount and receiver.`;

export const ADD_COLLATERAL_TEMPLATE = `Respond with a JSON object containing collateral addition information.
Extract the collateral details from all recent messages.

The response must include:
- bammAddress: The BAMM pool address
- collateralToken: The address of the collateral token
- amount: The amount of collateral to add (in ether values)
- error: An error message if valid bammAddress, collateralToken, or amount cannot be determined (optional)

Example response:
\`\`\`json
{
    "bammAddress": "0x1234567890123456789012345678901234567890",
    "collateralToken": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    "amount": "1000"
}
\`\`\`
\`\`\`json
{
    "bammAddress": "",
    "collateralToken": "",
    "amount": "",
    "error": "Required fields missing"
}
\`\`\`

{{recentMessages}}
Extract the collateral information from all recent messages.
Respond with a JSON markdown block containing bammAddress, collateralToken, and amount.`;

export const REMOVE_COLLATERAL_TEMPLATE = `Respond with a JSON object containing collateral withdrawal information.
Extract the withdrawal details from all recent messages.

The response must include:
- bammAddress: The BAMM pool address
- collateralToken: The address of the collateral token
- amount: The amount of collateral to withdraw (in ether values)
- error: An error message if valid bammAddress, collateralToken, or amount cannot be determined (optional)

Example response:
\`\`\`json
{
    "bammAddress": "0x1234567890123456789012345678901234567890",
    "collateralToken": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    "amount": "1000"
}
\`\`\`
\`\`\`json
{
    "bammAddress": "",
    "collateralToken": "",
    "amount": "",
    "error": "Required fields missing"
}
\`\`\`

{{recentMessages}}
Extract the withdrawal information from all recent messages.
Respond with a JSON markdown block containing bammAddress, collateralToken, and amount.`;

export const REPAY_TEMPLATE = `Respond with a JSON object containing repayment information.
Extract the repayment details from all recent messages.

The response must include:
- pairAddress: The BAMM pool address
- amount: The amount to repay (in ether values)
- error: An error message if valid pairAddress or amount cannot be determined (optional)

Example response:
\`\`\`json
{
    "pairAddress": "0x1234567890123456789012345678901234567890",
    "amount": "1000"
}
\`\`\`
\`\`\`json
{
    "pairAddress": "",
    "amount": "",
    "error": "No pool address found in context"
}
\`\`\`

{{recentMessages}}
Extract the repayment information from all recent messages.
Respond with a JSON markdown block containing pairAddress and amount.`;

export const WITHDRAW_TEMPLATE = `Respond with a JSON object containing withdrawal information.
Extract the withdrawal details from all recent messages.

The response must include:
- pairAddress: The BAMM pool address
- amount: The amount of LP tokens to withdraw (in ether values)
- error: An error message if valid pairAddress or amount cannot be determined (optional)

Example response:
\`\`\`json
{
    "pairAddress": "0x1234567890123456789012345678901234567890",
    "amount": "1000"
}
\`\`\`
\`\`\`json
{
    "pairAddress": "",
    "amount": "",
    "error": "No pool address found in context"
}
\`\`\`

{{recentMessages}}
Extract the withdrawal information from all recent messages.
Respond with a JSON markdown block containing pairAddress and amount.`;
