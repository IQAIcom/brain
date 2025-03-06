export const EXECUTE_JS_TEMPLATE = `Respond with a JSON object containing the JavaScript code to execute.
Extract the JavaScript code from all recent messages.

The response must include:
- code: The JavaScript code to be executed
- error: An error message if valid code cannot be determined (optional)

Example response:
\`\`\`json
{
    "code": "const a = 2 + 2; console.log(a); return a * 3;"
}
\`\`\`
\`\`\`json
{
    "code": "",
    "error": "No valid JavaScript code found"
}
\`\`\`

{{recentMessages}}
Extract the JavaScript code from all recent messages.
Respond with a JSON markdown block containing the code to be executed.`;
