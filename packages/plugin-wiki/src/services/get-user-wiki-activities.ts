import dedent from "dedent";
import { USER_ACTIVITIES_QUERY, WIKI_QUERY } from "../lib/queries";
import { IQ_BASE_URL } from "../lib/constants";
import { client } from "../lib/graphql";

export type ActivityType = "CREATED" | "UPDATED";

export class GetUserWikiActivitiesService {
	async execute(
		id: string,
		activityType?: ActivityType,
		timeFrameSeconds?: number,
	) {
		try {
			// biome-ignore lint/suspicious/noExplicitAny: the type UserWikiResponse is not exposing created
			const response: any = await client.request(USER_ACTIVITIES_QUERY, {
				id,
				limit: 50, // Increase limit to get more activities
			});

			if (
				!response.activitiesByUser ||
				response.activitiesByUser.length === 0
			) {
				throw new Error(
					`User has no wiki activities${activityType ? ` of type ${activityType}` : ""}`,
				);
			}

			let activities = response.activitiesByUser;

			// Filter by activity type if specified
			if (activityType) {
				activities = activities.filter(
					(activity) => activity.type === activityType,
				);

				if (activities.length === 0) {
					throw new Error(
						`User has no ${activityType.toLowerCase()} wiki activities`,
					);
				}
			}

			// Filter by time if timeFrameSeconds is provided
			if (timeFrameSeconds) {
				const now = new Date();
				const timeLimit = new Date(now.getTime() - timeFrameSeconds * 1000);

				// Filter activities by datetime
				activities = activities.filter((activity) => {
					if (!activity.datetime) return false;
					const activityDate = new Date(activity.datetime);
					return activityDate >= timeLimit;
				});

				if (activities.length === 0) {
					// Convert seconds to a human-readable format for the error message
					const timeFrameText =
						timeFrameSeconds >= 86400
							? `${Math.floor(timeFrameSeconds / 86400)} day(s)`
							: timeFrameSeconds >= 3600
								? `${Math.floor(timeFrameSeconds / 3600)} hour(s)`
								: `${Math.floor(timeFrameSeconds / 60)} minute(s)`;

					throw new Error(
						`No wiki ${activityType ? `${activityType.toLowerCase()} ` : ""}activities found in the last ${timeFrameText}`,
					);
				}
			}

			// Fetch additional metadata for edited wikis if needed
			if (
				activityType === "UPDATED" ||
				(!activityType && activities.some((a) => a.type === "UPDATED"))
			) {
				await this.enrichWithWikiMetadata(
					activities.filter((a) => a.type === "UPDATED"),
				);
			}

			return activities;
		} catch (error) {
			throw new Error(error.message);
		}
	}

	// Fetch additional metadata for edited wikis
	private async enrichWithWikiMetadata(activities) {
		for (const activity of activities) {
			if (!activity.content?.[0]) continue;

			try {
				// Get the full wiki details to access metadata
				const wikiId = activity.content[0].id;
				// biome-ignore lint/suspicious/noExplicitAny: GraphQL response type
				const wikiResponse: any = await client.request(WIKI_QUERY, {
					id: wikiId,
				});

				activity.enrichedMetadata = {
					wordsChanged: "Unknown",
					percentChanged: "Unknown",
					blocksChanged: "Unknown",
				};

				// Look for specific metadata if available
				const metadata = wikiResponse?.wiki?.metadata;
				if (metadata && Array.isArray(metadata)) {
					const wordsChanged = metadata.find((m) => m.id === "words-changed");
					const percentChanged = metadata.find(
						(m) => m.id === "percent-changed",
					);
					const blocksChanged = metadata.find((m) => m.id === "blocks-changed");

					if (wordsChanged?.value)
						activity.enrichedMetadata.wordsChanged = wordsChanged.value;
					if (percentChanged?.value)
						activity.enrichedMetadata.percentChanged = percentChanged.value;
					if (blocksChanged?.value)
						activity.enrichedMetadata.blocksChanged = blocksChanged.value;
				}
			} catch (error) {
				// Continue even if we can't get metadata for one wiki
				console.error(
					`Error fetching metadata for wiki ${activity.content[0].id}:`,
					error,
				);
			}
		}
	}

	formatCreated(activities) {
		return activities
			.map((activity) => {
				const wiki = activity.content[0];
				const date = new Date(activity.datetime);
				const formattedDate = date.toLocaleString();

				return dedent`
						📜 Created Wiki Details
						- Title: ${wiki.title}
						- Summary: ${wiki.summary}
						- Created: ${formattedDate}

						🔗 Source: ${IQ_BASE_URL}/${wiki.id}
						🔗 Transaction: https://polygonscan.com/tx/${wiki.transactionHash}
					`;
			})
			.join("\n\n");
	}

	formatEdited(activities) {
		return activities
			.map((activity) => {
				const wiki = activity.content[0];
				const date = new Date(activity.datetime);
				const formattedDate = date.toLocaleString();

				// Check if we have enriched metadata
				let editDetails = "";
				if (activity.enrichedMetadata) {
					if (
						activity.enrichedMetadata.wordsChanged !== "Unknown" &&
						activity.enrichedMetadata.percentChanged !== "Unknown"
					) {
						editDetails += `- Changes: ${activity.enrichedMetadata.wordsChanged} words (${activity.enrichedMetadata.percentChanged}%)\n`;
					}

					if (activity.enrichedMetadata.blocksChanged !== "Unknown") {
						editDetails += `- Modified sections: ${activity.enrichedMetadata.blocksChanged}\n`;
					}
				}

				// If we couldn't get metadata, use a simpler format
				if (!editDetails) {
					editDetails = "- Edit details not available\n";
				}

				return dedent`
						📜 Edited Wiki Details
						- Title: ${wiki.title}
						- Summary: ${wiki.summary}
						- Edited: ${formattedDate}
						${editDetails}
						🔗 Source: ${IQ_BASE_URL}/${wiki.id}
						🔗 Transaction: https://polygonscan.com/tx/${wiki.transactionHash}
					`;
			})
			.join("\n\n");
	}

	format(activities) {
		return activities
			.map((activity) => {
				const wiki = activity.content[0];
				const date = new Date(activity.datetime);
				const formattedDate = date.toLocaleString();
				const actionType = activity.type === "CREATED" ? "Created" : "Edited";

				// Add edit details for edited wikis
				let editDetails = "";
				if (activity.type === "UPDATED" && activity.enrichedMetadata) {
					if (
						activity.enrichedMetadata.wordsChanged !== "Unknown" &&
						activity.enrichedMetadata.percentChanged !== "Unknown"
					) {
						editDetails += `- Changes: ${activity.enrichedMetadata.wordsChanged} words (${activity.enrichedMetadata.percentChanged}%)\n`;
					}

					if (activity.enrichedMetadata.blocksChanged !== "Unknown") {
						editDetails += `- Modified sections: ${activity.enrichedMetadata.blocksChanged}\n`;
					}
				}

				return dedent`
						📜 Wiki ${actionType}
						- Title: ${wiki.title}
						- Summary: ${wiki.summary}
						- ${actionType}: ${formattedDate}
						${editDetails}
						🔗 Source: ${IQ_BASE_URL}/${wiki.id}
						🔗 Transaction: https://polygonscan.com/tx/${wiki.transactionHash}
					`;
			})
			.join("\n\n");
	}
}
