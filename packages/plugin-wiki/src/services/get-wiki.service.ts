import type { IAgentRuntime, Memory, State } from "@elizaos/core";
import dedent from "dedent";
import { InputParserService } from "./input-parser";
import { WIKI_TEMPLATE } from "../lib/templates";
import { Wiki, type Wiki as WikiType } from "@everipedia/iq-utils";
import { gql, request } from "graphql-request";
import type { IQWikiResponse } from "../lib/types";

export class GetWikiService {
	private readonly API_URL = "https://graph.everipedia.org/graphql";

	async execute(runtime: IAgentRuntime, message: Memory, state: State) {
		const inputParser = new InputParserService();

		const parsedOutput = await inputParser.parseInputs({
			runtime,
			message,
			state,
			template: WIKI_TEMPLATE,
		});

		const { wikiId } = parsedOutput;

		if ("error" in parsedOutput) {
			return new Error(parsedOutput.error);
		}

		const query = gql`
            {
                wiki(id: "${wikiId}") {
                    id
                    ipfs
                    title
                    summary
                }
            }
        `;

		try {
			const response: IQWikiResponse = await request(this.API_URL, query);

			if (!response.wiki) {
				throw new Error("Wiki Not found");
			}
			return response.wiki as WikiType;
		} catch (error) {
			throw new Error(error.message);
		}
	}

	format(wiki: WikiType) {
		const formattedWiki = dedent`
        	📜 Wiki Details
        	- Here's a summary of ${wiki.title} \n
            - ${wiki.summary} \n\n
            🔗 souce: https://iq.wiki/wiki/${wiki.id}
        `;

		return formattedWiki;
	}
}
