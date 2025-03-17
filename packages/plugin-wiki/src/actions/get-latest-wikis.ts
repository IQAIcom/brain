import type { Action, Handler } from "@elizaos/core";
import { GetUserWikiService } from "../services/get-user-wikis.service";
import type { Wiki } from "@everipedia/iq-utils";

export const getUserWikisAction = (): Action => {
	return {
		name: "USER_WIKIS",
		description: "Gets the latest wikis per user from the IQ.Wiki platform",
		similes: ["GET_USER_WIKIS", "CHECK_USER_WIKIS"],
		validate: async () => true,
		handler: handler(),
		examples: [],
	};
};

const handler: () => Handler =
	() => async (runtime, message, state, _options, callback) => {
		try {
			const service = new GetUserWikiService();
			const response = await service.execute(runtime, message, state);

			if (response instanceof Error) {
				callback?.({
					text: response.message,
				});
				return false;
			}
			// console.log(response)
			callback?.({
				text: service.format(response as Partial<Wiki[]>),
			});

			return true;
		} catch (error) {
			callback?.({
				text: `Error: ${error.message.split(":")[0] || error.message}`,
			});
			return false;
		}
	};
