import type { Action, Handler } from "@elizaos/core";
import { GetUserWikiActivitiesService } from "../services/get-user-wiki-activities";
import { InputParserService } from "../services/input-parser";
import { USER_WIKIS_TEMPLATE } from "../lib/templates";

export const getUserCreatedWikisAction = (): Action => {
	return {
		name: "USER_CREATED_WIKIS",
		description: "Gets the wikis created by a user from the IQ.Wiki platform",
		similes: ["GET_USER_CREATED_WIKIS", "CHECK_USER_CREATED_WIKIS"],
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
			const response = await service.execute(id, "CREATED", timeFrameSeconds);

			callback?.({
				text: service.formatCreated(response),
			});

			return true;
		} catch (error) {
			callback?.({
				text: `Error: ${error.message.split(":")[0] || error.message}`,
			});
			return false;
		}
	};
