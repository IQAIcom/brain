import type { Action, Handler } from "@elizaos/core";
import { InputParserService } from "./input-parser";
import { SEQUENCER_TEMPLATE } from "../lib/template";

export const getSequencerAction = (): Action => {
	return {
		name: "Sequencer",
		similes: ["SEQUENCER"],
		examples: [],
		description:
			"Evaluates the goal and determines if the query should be handled with multiple action calls",
		validate: async () => true,
		handler: handler(),
	};
};

const handler: () => Handler =
	() => async (runtime, message, state, _options, _callback) => {
		const inputParser = new InputParserService();
		const actions = await inputParser.parseInputs({
			runtime,
			message,
			state,
			template: SEQUENCER_TEMPLATE,
		});

		console.log("ACTIONS", actions);
	};
