import type { Action, Handler } from "@elizaos/core";
import { GetUserWikiActivitiesService } from "../services/get-user-wiki-activities";
import { InputParserService } from "../services/input-parser";
import { USER_WIKIS_TEMPLATE } from "../lib/templates";

export const getUserEditedWikisAction = (): Action => {
	return {
		name: "USER_EDITED_WIKIS",
		description: "Gets the wikis edited by a user from the IQ.Wiki platform",
		similes: ["GET_USER_EDITED_WIKIS", "CHECK_USER_EDITED_WIKIS"],
		validate: async () => true,
		handler: handler(),
		examples: [],
	};
};

const handler: () => Handler =
	() => async (runtime, message, state, _options, callback) => {
		try {
			const inputParser = new InputParserService();
			const { id, timeFrameSeconds, error } = await inputParser.parseInputs({
				runtime,
				message,
				state,
				template: USER_WIKIS_TEMPLATE,
			});

			if (error) {
				callback?.({
					text: `❌ ${error}`,
				});
				return false;
			}

			// Inform user that time filtering may not be accurate for edited wikis
			if (timeFrameSeconds) {
				callback?.({
					text: `ℹ️ Note: Time filtering for edited wikis may not be accurate as the API doesn't provide reliable timestamps for edits. Showing all available edits instead.`,
				});
			}

			const service = new GetUserWikiActivitiesService();
			const response = await service.execute(id, "UPDATED", timeFrameSeconds);

			callback?.({
				text: service.formatEdited(response),
			});

			return true;
		} catch (error) {
			callback?.({
				text: `Error: ${error.message.split(":")[0] || error.message}`,
			});
			return false;
		}
	};
