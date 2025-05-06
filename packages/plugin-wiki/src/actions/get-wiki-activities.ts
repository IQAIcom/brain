import type { Action, Handler } from "@elizaos/core";
import { GetUserWikiActivitiesService } from "../services/get-user-wiki-activities";
import { InputParserService } from "../services/input-parser";
import { USER_WIKIS_TEMPLATE } from "../lib/templates";

export const getUserWikiActivitiesAction = (): Action => {
	return {
		name: "USER_WIKI_ACTIVITIES",
		description:
			"Gets all wiki activities (created and edited) by a user from the IQ.Wiki platform",
		similes: ["GET_USER_WIKI_ACTIVITIES", "CHECK_USER_WIKI_ACTIVITIES"],
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

			const service = new GetUserWikiActivitiesService();
			const response = await service.execute(id, undefined, timeFrameSeconds);

			callback?.({
				text: service.format(response),
			});

			return true;
		} catch (error) {
			callback?.({
				text: `Error: ${error.message.split(":")[0] || error.message}`,
			});
			return false;
		}
	};
