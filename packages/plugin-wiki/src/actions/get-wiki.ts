import type { Action, Handler } from "@elizaos/core";
import { GetWikiService } from "../services/get-wiki.service";

export const getWikiAction = (): Action => {
	return {
		name: "IQ_WIKI",
		description: "Get a wiki from the IQ.Wiki platform",
		similes: ["GET_WIKI", "CHECK_WIKI"],
		validate: async () => true,
		handler: handler(),
		examples: [],
	};
};

const handler: () => Handler =
	() => async (runtime, message, state, _options, callback) => {
		try {
			const service = new GetWikiService();
			const response = await service.execute(runtime, message, state);

			if (response instanceof Error) {
				callback?.({
					text: response.message,
				});
				return false;
			}
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
