import type { IAgentRuntime, Memory, State } from "@elizaos/core";
import dedent from "dedent";
import { InputParserService } from "./input-parser";
import { WIKI_TEMPLATE } from "../lib/templates";
import { Wiki, type Wiki as WikiType } from "@everipedia/iq-utils";
import { gql, request } from "graphql-request";
import type { IQWikiResponse } from "../lib/types";
import { WIKI_QUERY } from "../lib/queries";
import { IQ_API_URL, IQ_BASE_URL } from "../lib/constants";

export class GetWikiService {
	async execute(runtime: IAgentRuntime, message: Memory, state: State) {
		const inputParser = new InputParserService();

		const parsedOutput = await inputParser.parseInputs({
			runtime,
			message,
			state,
			template: WIKI_TEMPLATE,
		});

		if ("error" in parsedOutput) {
			return new Error(parsedOutput.error);
		}

		const { id } = parsedOutput;

		const query = WIKI_QUERY(id);

		try {
			const response: IQWikiResponse = await request(IQ_API_URL, query);

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
            🔗 souce: ${IQ_BASE_URL}/${wiki.id}
        `;

		return formattedWiki;
	}
}
