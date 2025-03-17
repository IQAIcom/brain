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

{{recentMessages}}
Extract the wiki information from the most recent message.
Respond with a JSON markdown block containing all required fields.`;

export const USER_WIKIS_TEMPLATE = `Respond with a JSON object containing wiki information.

Extract the user id details as it is from the most recent message. Do not convert the hex value If the required information is missing, respond with an error.

The response must include:
- id: The ethereum id


Example response:
\`\`\`json
{
    "id": "0x8AF7a19a26d8FBC48dEfB35AEfb15Ec8c407f889"
}
\`\`\`

{{recentMessages}}
Extract the user id information from the most recent message.
Respond with a JSON markdown block containing all required fields.`;
