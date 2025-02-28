import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import dedent from "dedent";

export function generateToolTemplate(tool: Tool): string {
	return dedent`
    Respond with a JSON object containing parameters for the tool "${tool.name}".
    Extract the parameters from the recent messages according to this schema:
    ${JSON.stringify(tool.inputSchema, null, 2)}

    The response must include:
    - All required parameters from the schema
    - error: An error message if valid parameters cannot be determined (optional)

    Example response:
    \`\`\`json
    {
      ...valid parameters matching schema
    }
    \`\`\`
    \`\`\`json
    {
      "error": "Missing required parameter: [parameter name]"
    }
    \`\`\`

    {{recentMessages}}
    Extract the parameters from all recent messages.
    Respond with a JSON markdown block containing the required parameters.
  `;
}
