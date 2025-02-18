export const LEND_TEMPLATE = `Respond with a JSON object containing lending information.
Extract the lending details from all recent messages.

The response must include:
- bammAddress: The BAMM contract address
- amount: The amount to lend in normal decimal form (e.g., "10" for 10 tokens)
- error: An error message if valid poolAddress or amount cannot be determined (optional)

Example response:
\`\`\`json
{
    "bammAddress": "0x1234567890123456789012345678901234567890",
    "amount": "1000"
}
\`\`\`
\`\`\`json
{
    "bammAddress": "",
    "amount": "",
    "error": "No pool address or token address found in context"
}
\`\`\`

{{recentMessages}}
Extract the lending information from all recent messages.
Respond with a JSON markdown block containing bammAddress and amount.`;
export const BORROW_TEMPLATE = `Respond with a JSON object containing borrowing information.
Extract the borrowing details from all recent messages.

The response must include:
- bammAddress: The BAMM pool address
- borrowToken: The address of the token to borrow
- amount: The amount to borrow (in human-readable form)
- collateralToken: The address of the token to use as collateral
- error: An error message if required parameters cannot be determined (optional)

Example response:
\`\`\`json
{
    "bammAddress": "0x1234567890123456789012345678901234567890",
    "borrowToken": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    "amount": "1000",
    "collateralToken": "0x9876543210987654321098765432109876543210"
}
\`\`\`
\`\`\`json
{
    "bammAddress": "",
    "borrowToken": "",
    "amount": "",
    "collateralToken": "",
    "error": "Required fields missing"
}
\`\`\`

{{recentMessages}}
Extract the borrowing information from all recent messages.
Respond with a JSON markdown block containing bammAddress, borrowToken, amount, and collateralToken.`;

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
- bammAddress: The BAMM pool address
- borrowToken: The address of the token being repaid (the borrowed token)
- amount: The amount to repay (in human-readable form)
- collateralToken: The address of the collateral token.
- error: An error message if valid parameters cannot be determined (optional)

Example response:
\`\`\`json
{
    "bammAddress": "0x1234567890123456789012345678901234567890",
    "borrowToken": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    "amount": "500",
    "collateralToken": "0x9876543210987654321098765432109876543210",
    "error": ""
}
\`\`\`
\`\`\`json
{
    "bammAddress": "",
    "borrowToken": "",
    "amount": "",
    "collateralToken": "",
    "error": "Required fields missing"
}
\`\`\`

{{recentMessages}}
Extract the repayment information from all recent messages.
Respond with a JSON markdown block containing bammAddress, borrowToken, amount, and collateralToken.`;

export const WITHDRAW_TEMPLATE = `Respond with a JSON object containing withdrawal information.
Extract the withdrawal details from all recent messages.

The response must include:
- bammAddress: The BAMM pool address
- amount: The amount of BAMM tokens to redeem for LP tokens (in normal decimal form)
- error: An error message if valid bammAddress or amount cannot be determined (optional)

Example response:
\`\`\`json
{
    "bammAddress": "0x1234567890123456789012345678901234567890",
    "amount": "1000"
}
\`\`\`
\`\`\`json
{
    "bammAddress": "",
    "amount": "",
    "error": "No pool address found in context"
}
\`\`\`

{{recentMessages}}
Extract the withdrawal information from all recent messages.
Respond with a JSON markdown block containing bammAddress and amount.`;
