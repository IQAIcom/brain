import type { Evaluator, Handler } from "@elizaos/core";

export const getSequencerEvaluator = (): Evaluator => {
	return {
		name: "Sequencer",
		similes: ["SEQUENCER"],
		examples: [],
		description:
			"Evaluates if a query should be handled by the Sequencer service",
		validate: async () => true,
		handler: handler(),
	};
};

const handler: () => Handler =
	() => async (_runtime, _message, _state, _options, _callback) => {
		console.log("EVALUATOR TRIGGER");
		return true;
	};
