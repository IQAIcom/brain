import dedent from "dedent";
import type { Wiki } from "@everipedia/iq-utils";
import { request } from "graphql-request";
import type { IQWikiResponse } from "../types";
import { WIKI_QUERY } from "../lib/queries";
import { IQ_API_URL, IQ_BASE_URL } from "../lib/constants";
import { elizaLogger } from "@elizaos/core";

export class GetWikiService {
	async execute(id: string) {
		const query = WIKI_QUERY(id);

		try {
			const response: IQWikiResponse = await request(IQ_API_URL, query);

			if (!response.wiki) {
				throw new Error("Wiki Not found");
			}
			return response.wiki as Wiki;
		} catch (error) {
			throw new Error(error.message);
		}
	}

	format(wiki: Wiki) {
		const formattedWiki = dedent`
      📜 Wiki Details
      - Here's a summary of ${wiki.title} \n
      - ${wiki.summary} \n\n
      🔗 source: ${IQ_BASE_URL}/${wiki.id}
    `;

		return formattedWiki;
	}
}
