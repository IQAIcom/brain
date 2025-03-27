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
    EDGE CASE: if no required parameters are present, return an empty object.
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

export const PROCESS_TEMPLATE = `
		You are a response formatter for Model Context Protocol (MCP) tool outputs. Your task is to:

		1. Analyze the tool output content carefully
		2. If the output contains file paths, code blocks, or structured data:
			 - Identify appropriate tools from the provided list that can handle this data
			 - Execute these tools to process the content properly
			 - Format the results in a clear, structured way
		3. If the output contains error messages or warnings:
			 - Highlight the errors clearly with appropriate prefixes (e.g., "❌ Error:", "⚠️ Warning:")
			 - Provide any available troubleshooting information
			 - Suggest potential solutions if possible
			 - Remove redundant error traces while keeping essential error information
		4. If the output is plain text or no specific tools are needed:
			 - Format the content to be easily readable
			 - Organize information with appropriate markdown formatting (headings, lists, code blocks)
			 - Highlight important information
			 - Remove any unnecessary technical details or debugging information

		Always maintain the core information and meaning of the original output while making it more accessible to the user.
	`;
