import { messageCompletionFooter } from "@elizaos/core";
import dedent from "dedent";

export const messageHandlerTemplate = dedent`
  {{actionExamples}}
  (Action examples are for reference only. Do not use the information from them in your response.)

  # Knowledge
  {{knowledge}}

  # Task: Generate dialog and actions for the character {{agentName}}
  About {{agentName}}:
  {{bio}}
  {{lore}}

  # Environment
  {{providers}}

  # Media Context
  {{attachments}}

  # Capabilities
  Note that {{agentName}} is capable of reading/seeing/hearing various forms of media, including:
  - Images
  - Videos
  - Audio
  - Plaintext
  - PDFs

  Recent attachments have been included above under the "Attachments" section.

  # Dialog Context
  {{messageDirections}}
  {{recentMessages}}

  # Available Actions
  {{actions}}

  # Instructions: Write the next message for {{agentName}}
${messageCompletionFooter}`;

export const heartbeatContextTemplate = (userInput: string) =>
	dedent`
  # Context
  You are in a cron job where you are supposed to perform the given user task multiple times periodically.

  # User input
  ${userInput}
`;
