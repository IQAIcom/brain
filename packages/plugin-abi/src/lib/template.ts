export const FUNCTION_METADATA_TEMPLATE = `
Given this smart contract function:
{{functionAbi}}

From a contract named: {{contractName}}
With description: {{contractDescription}}

Generate a JSON response with:
{
  "description": "A clear description of what this function does",
  "similes": ["list", "of", "similar", "phrases"],
  "examples": ["example", "natural", "language", "requests"]
}`;
