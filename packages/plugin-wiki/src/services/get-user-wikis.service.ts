import type { IAgentRuntime, Memory, State } from "@elizaos/core";
import dedent from "dedent";
import { InputParserService } from "./input-parser";
import { USER_WIKIS_TEMPLATE } from "../lib/templates";
import type { Wiki, Wiki as WikiType } from "@everipedia/iq-utils";
import { request } from "graphql-request";
import type { UserWikisResponse } from "../lib/types";
import { USER_WIKIS } from "../lib/queries";
import { IQ_API_URL, IQ_BASE_URL } from "../lib/constants";

export class GetUserWikiService {
	async execute(runtime: IAgentRuntime, message: Memory, state: State) {
		const inputParser = new InputParserService();

		const parsedOutput = await inputParser.parseInputs({
			runtime,
			message,
			state,
			template: USER_WIKIS_TEMPLATE,
		});

		if ("error" in parsedOutput) {
			return new Error(parsedOutput.error);
		}

		const { id } = parsedOutput;

		const query = USER_WIKIS(id);

		try {
			const response: UserWikisResponse = await request(IQ_API_URL, query);

			if (!response.userById) {
				throw new Error("user does not exist");
			}
			if (!response.userById.wikisCreated.activity) {
				throw new Error("user has not created any wikis");
			}

			return response.userById.wikisCreated.activity[0].content.map(
				(activity) => activity,
			) as Partial<Wiki>[];
		} catch (error) {
			throw new Error(error.message);
		}
	}

	format(wikis: WikiType[]) {
		return wikis
			.map(
				(wiki) => dedent`
                📜 Wiki Details
                - Here's a summary of ${wiki.title} \n
                - ${wiki.summary} \n\n
                🔗 Source: ${IQ_BASE_URL}/${wiki.id}
            `,
			)
			.join("\n\n");
	}
}
