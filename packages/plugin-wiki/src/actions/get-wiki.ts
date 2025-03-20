import type { Action, Handler } from "@elizaos/core";
import { GetWikiService } from "../services/get-wiki";
import { InputParserService } from "../services/input-parser";
import { WIKI_TEMPLATE } from "../lib/templates";

export const getWikiAction = (): Action => {
	return {
		name: "GET_WIKI",
		description: "Get a wiki from the IQ.Wiki platform",
		similes: [
			"WIKI_DETAILS",
			"CHECK_WIKI",
			"FETCH_WIKI",
			"RETRIEVE_WIKI",
			"VIEW_WIKI",
			"WIKI_INFO",
			"GET_WIKI_PAGE",
			"FIND_WIKI",
			"LOOK_UP_WIKI",
			"SEARCH_WIKI",
			"WIKI_LOOKUP",
			"ACCESS_WIKI",
			"READ_WIKI",
			"SHOW_WIKI",
			"DISPLAY_WIKI",
		],

		validate: async () => true,
		handler: handler(),
		examples: [],
	};
};

const handler: () => Handler =
	() => async (runtime, message, state, _options, callback) => {
		try {
			const inputParser = new InputParserService();
			const { id, error } = await inputParser.parseInputs({
				runtime,
				message,
				state,
				template: WIKI_TEMPLATE,
			});

			if (error) {
				callback?.({
					text: `❌ ${error}`,
				});
				return false;
			}

			const service = new GetWikiService();
			const response = await service.execute(id);

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
