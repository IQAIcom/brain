export const WIKI_TEMPLATE = `Respond with a JSON object containing wiki information.

Extract the wiki details from the most recent message. If the required information is missing, respond with an error.

The response must include:
- id: The id of the wiki


Example response:
\`\`\`json
{
    "id": "bitcoin"
}
\`\`\`
\`\`\`json
{
    "error": "id not provided"
}
\`\`\`


{{recentMessages}}
Extract the wiki information from the most recent message.
Respond with a JSON markdown block containing all required fields.`;

export const USER_WIKIS_TEMPLATE = `Respond with a JSON object containing wiki information.

Extract the user id details as it is from the most recent message. Do not convert the hex value. If the required information is missing, respond with an error.
Also extract any time period mentioned (e.g., "last hour", "last 10 minutes", "past day") and convert it to seconds.

The response must include:
- id: The ethereum id
- timeFrameSeconds: (optional) The time period in seconds to filter results by

Example response:
\`\`\`json
{
    "id": "0x8AF7a19a26d8FBC48dEfB35AEfb15Ec8c407f889",
    "timeFrameSeconds": 3600
}
\`\`\`
\`\`\`json
{
    "id": "0x8AF7a19a26d8FBC48dEfB35AEfb15Ec8c407f889"
}
\`\`\`
\`\`\`json
{
    "error": "proper id not provided"
}
\`\`\`

{{recentMessages}}
Extract the user id information and convert any time period to seconds.
For example:
- "last hour" → 3600 seconds
- "last 10 minutes" → 600 seconds
- "past day" → 86400 seconds
Respond with a JSON markdown block containing all required fields.`;
