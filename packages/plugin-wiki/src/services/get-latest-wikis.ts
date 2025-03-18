import dedent from "dedent";
import type { Wiki } from "@everipedia/iq-utils";
import { request } from "graphql-request";
import { USER_WIKIS } from "../lib/queries";
import { IQ_API_URL, IQ_BASE_URL } from "../lib/constants";

export class GetLatestWikisService {
	async execute(id: string, timeFrameSeconds?: number) {
		const query = USER_WIKIS(id);

		try {
			// biome-ignore lint/suspicious/noExplicitAny: the type UserWikiResponse is not exposing created
			const response: any = await request(IQ_API_URL, query);

			if (!response.userById) {
				throw new Error("user does not exist");
			}
			if (!response.userById.wikisCreated.activity) {
				throw new Error("user has not created any wikis");
			}

			let wikis = response.userById.wikisCreated.activity[0].content.map(
				(activity) => activity,
			);

			// Filter by time if timeFrameSeconds is provided
			if (timeFrameSeconds) {
				const now = new Date();
				const timeLimit = new Date(now.getTime() - timeFrameSeconds * 1000);

				// Filter wikis by creation time
				// biome-ignore lint/suspicious/noExplicitAny: the type wiki is not exposing created
				wikis = wikis.filter((wiki: any) => {
					if (!wiki.created) return false;
					const wikiDate = new Date(wiki.created);
					return wikiDate >= timeLimit;
				});

				if (wikis.length === 0) {
					// Convert seconds to a human-readable format for the error message
					const timeFrameText =
						timeFrameSeconds >= 86400
							? `${timeFrameSeconds / 86400} day(s)`
							: timeFrameSeconds >= 3600
								? `${timeFrameSeconds / 3600} hour(s)`
								: `${timeFrameSeconds / 60} minute(s)`;

					throw new Error(`No wikis found in the last ${timeFrameText}`);
				}
			}

			return wikis;
		} catch (error) {
			throw new Error(error.message);
		}
	}

	format(wikis: Wiki[]) {
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
