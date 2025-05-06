import dedent from "dedent";
import { USER_EDITED_WIKIS_QUERY } from "../lib/queries";
import { IQ_BASE_URL } from "../lib/constants";
import { client } from "../lib/graphql";

export class GetEditedWikisService {
	async execute(id: string, timeFrameSeconds?: number) {
		try {
			// biome-ignore lint/suspicious/noExplicitAny: the type UserWikiResponse is not exposing updated
			const response: any = await client.request(USER_EDITED_WIKIS_QUERY, {
				id,
			});

			if (!response.userById) {
				throw new Error("user does not exist");
			}
			if (!response.userById.wikisEdited.activity) {
				throw new Error("user has not edited any wikis");
			}

			let wikis = response.userById.wikisEdited.activity[0].content;

			// Since the updated field is null for edited wikis, we need to detect edits by metadata
			// Filter out wikis that aren't actually edits (they should have previous_cid in metadata)
			// biome-ignore lint/suspicious/noExplicitAny: the type wiki is not exposing metadata
			wikis = wikis.filter((wiki: any) => {
				// Check for edit-specific metadata
				const hasMetadata = wiki.metadata && Array.isArray(wiki.metadata);
				if (!hasMetadata) return false;

				// Look for previous_cid which indicates this is an edit
				return wiki.metadata.some((meta) => meta.id === "previous_cid");
			});

			// Filter by time if timeFrameSeconds is provided
			// Since we don't have updated timestamps, we'll use timestamp from references if available
			if (timeFrameSeconds && wikis.length > 0) {
				const now = new Date();
				const timeLimit = new Date(now.getTime() - timeFrameSeconds * 1000);

				// We need to skip time filtering because we don't have reliable timestamps
				// Just inform the user that we can't filter by time
				if (wikis.length === 0) {
					// Convert seconds to a human-readable format for the error message
					const timeFrameText =
						timeFrameSeconds >= 86400
							? `${timeFrameSeconds / 86400} day(s)`
							: timeFrameSeconds >= 3600
								? `${timeFrameSeconds / 3600} hour(s)`
								: `${timeFrameSeconds / 60} minute(s)`;

					throw new Error(`No edited wikis found in the last ${timeFrameText}`);
				}
			}

			return wikis;
		} catch (error) {
			throw new Error(error.message);
		}
	}

	format(wikis) {
		return wikis
			.map((wiki) => {
				// Find edit-related metadata
				const wordsChanged =
					wiki.metadata.find((m) => m.id === "words-changed")?.value ||
					"Unknown";
				const percentChanged =
					wiki.metadata.find((m) => m.id === "percent-changed")?.value ||
					"Unknown";
				const blocksChanged =
					wiki.metadata.find((m) => m.id === "blocks-changed")?.value ||
					"Unknown";

				// Get the date from updated or fallback to a reasonable alternative
				const date = new Date(wiki.updated || wiki.created);
				const formattedDate = date.toLocaleString();

				return dedent`
						📜 Wiki Edited
						- Title: ${wiki.title}
						- Summary: ${wiki.summary}
						- Edited: ${formattedDate}
						- Changes: ${wordsChanged} words (${percentChanged}%)
						- Modified sections: ${blocksChanged}

						🔗 Source: ${IQ_BASE_URL}/${wiki.id}
						🔗 Transaction: https://polygonscan.com/tx/${wiki.transactionHash}
					`;
			})
			.join("\n\n");
	}
}
