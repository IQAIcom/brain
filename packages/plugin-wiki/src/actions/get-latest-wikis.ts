import type { Action, Handler } from "@elizaos/core";
import { GetLatestWikisService } from "../services/get-latest-wikis";
import type { Wiki } from "@everipedia/iq-utils";
import { InputParserService } from "../services/input-parser";
import { USER_WIKIS_TEMPLATE } from "../lib/templates";

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

			const service = new GetLatestWikisService();
			const response = await service.execute(id, timeFrameSeconds);

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
