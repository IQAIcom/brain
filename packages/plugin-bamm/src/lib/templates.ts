// Base template for simple amount operations (LEND/WITHDRAW)
export const SIMPLE_AMOUNT_TEMPLATE = `Respond with a JSON object containing {{operation}} information.
Extract the {{operation}} details from all recent messages.

The response must include:
- bammAddress: The BAMM pool address
- amount: The amount to {{operation}} in normal decimal form (e.g., "10" for 10 tokens)
- error: An error message if valid parameters cannot be determined (optional)

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
    "error": "Required fields missing"
}
\`\`\`

{{recentMessages}}
Extract the {{operation}} information from all recent messages.
Respond with a JSON markdown block containing bammAddress and amount.`;

// Template for token operations (BORROW/REPAY)
export const TOKEN_OPERATION_TEMPLATE = `Respond with a JSON object containing {{operation}} information.
Extract the {{operation}} details from all recent messages.

The response must include:
- bammAddress: The BAMM pool address
- {{tokenType}}: The address of the token (optional)
- {{tokenType}}Symbol: The symbol of the token (optional)
- amount: The amount to {{operation}} in normal decimal form (e.g., "10" for 10 tokens)
- error: An error message if valid parameters cannot be determined (optional)

IMPORTANT: Either the {{tokenType}} or {{tokenType}}Symbol must be provided.

Example response:
\`\`\`json
{
    "bammAddress": "0x1234567890123456789012345678901234567890",
    "{{tokenType}}": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    "{{tokenType}}Symbol": null,
    "amount": "1000"
}
\`\`\`
\`\`\`json
{
    "bammAddress": "0x1234567890123456789012345678901234567890",
    "{{tokenType}}": null,
    "{{tokenType}}Symbol": "USDC",
    "amount": "1000"
}
\`\`\`
\`\`\`json
{
    "bammAddress": "",
    "{{tokenType}}": "",
    "{{tokenType}}Symbol": "",
    "amount": "",
    "error": "Required fields missing"
}
\`\`\`

{{recentMessages}}
Extract the {{operation}} information from all recent messages.
Respond with a JSON markdown block containing bammAddress, {{tokenType}}, and amount.`;

// Export specific templates using the base templates
export const LEND_TEMPLATE = SIMPLE_AMOUNT_TEMPLATE.replace(
	/{{operation}}/g,
	"lending",
);
export const WITHDRAW_TEMPLATE = SIMPLE_AMOUNT_TEMPLATE.replace(
	/{{operation}}/g,
	"withdrawal",
);

export const BORROW_TEMPLATE = TOKEN_OPERATION_TEMPLATE.replace(
	/{{operation}}/g,
	"borrowing",
).replace(/{{tokenType}}/g, "borrowToken");

export const REPAY_TEMPLATE = TOKEN_OPERATION_TEMPLATE.replace(
	/{{operation}}/g,
	"repayment",
).replace(/{{tokenType}}/g, "borrowToken");

export const ADD_COLLATERAL_TEMPLATE = TOKEN_OPERATION_TEMPLATE.replace(
	/{{operation}}/g,
	"collateral addition",
).replace(/{{tokenType}}/g, "collateralToken");

export const REMOVE_COLLATERAL_TEMPLATE = TOKEN_OPERATION_TEMPLATE.replace(
	/{{operation}}/g,
	"collateral withdrawal",
).replace(/{{tokenType}}/g, "collateralToken");
