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
			const quote = await service.execute(runtime, message, state);

			if (quote instanceof Error) {
				callback?.({
					text: `Error fetching quote: ${quote.message}`,
				});
				return false;
			}
			callback?.({
				text: service.format(quote),
			});

			return true;
		} catch (error) {
			callback?.({
				text: `Error fetching quote: ${error.message}`,
			});
			return false;
		}
	};
