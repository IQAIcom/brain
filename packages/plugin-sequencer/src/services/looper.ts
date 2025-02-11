import type { Evaluator, Handler } from "@elizaos/core";

export const getLoopEvaluator = (): Evaluator => {
	return {
		name: "Looper",
		similes: ["LOOP"],
		examples: [],
		description:
			"Evaluates the goal and determines if the query should be handled with multiple action calls",
		validate: async () => true,
		handler: handler(),
		alwaysRun: true,
	};
};

const handler: () => Handler =
	() => async (_runtime, _message, _state, _options, _callback) => {
		console.log("EVALUATOR TRIGGER");
		return true;
	};
