import type { Tool } from "@coinbase/cdp-langchain";
import { type State, composeContext } from "@elizaos/core";
import dedent from "dedent";

export class ContextComposer {
	forParameters(tool: Tool, state: State): string {
		return composeContext({
			state,
			template: this.getParameterTemplate(tool),
		});
	}

	forResponse(tool: Tool, result: unknown, state: State): string {
		return composeContext({
			state,
			template: this.getResponseTemplate(tool, result),
		});
	}

	private getParameterTemplate(tool: Tool): string {
		return dedent`
              {{recentMessages}}

              Given the recent messages, extract the following information for the action "${tool.name}":
              ${tool.description}
          `;
	}

	private getResponseTemplate(tool: Tool, result: unknown): string {
		return dedent`
            # Action Examples
            {{actionExamples}}

            # Knowledge
            {{knowledge}}

            # Task: Generate dialog and actions for the character {{agentName}}.
            About {{agentName}}:
            {{bio}}
            {{lore}}

            {{providers}}

            {{attachments}}

            # Capabilities
            Note that {{agentName}} is capable of reading/seeing/hearing various forms of media, including images, videos, audio, plaintext and PDFs. Recent attachments have been included above under the "Attachments" section.

            The action "${tool.name}" was executed successfully.
            Here is the result:
            ${JSON.stringify(result)}

            {{actions}}

            Respond to the message knowing that the action was successful and these were the previous messages:
            {{recentMessages}}
        `;
	}
}
