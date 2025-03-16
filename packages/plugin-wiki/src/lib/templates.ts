export const WIKI_TEMPLATE = `Respond with a JSON object containing wiki information.

Extract the wiki details from the most recent message. If the required information is missing, respond with an error.

The response must include:
- wikiId: The id of the wiki


Example response:
\`\`\`json
{
    "wikiId": "bitcoin"
}
\`\`\`

{{recentMessages}}
Extract the wiki information from the most recent message.
Respond with a JSON markdown block containing all required fields.`;
