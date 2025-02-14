import type { Action, Handler } from "@elizaos/core";
import { SequencerService } from "../services/sequencer";
import dedent from "dedent";

export const getSequencerAction = (): Action => {
	return {
		name: "SEQUENCER",
		similes: ["SEQUENCER"],
		examples: [],
		description:
			"Evaluates the goal and determines if the query should be handled with multiple action calls",
		validate: async () => true,
		handler: handler(),
	};
};

const handler: () => Handler =
	() => async (runtime, message, state, _options, callback) => {
		try {
			const sequencerService = new SequencerService(
				runtime,
				message,
				state,
				callback,
			);
			return await sequencerService.execute();
		} catch (error) {
			callback?.({
				text: dedent`
        ❌ Sequencer Operation Failed

        Error: ${error.message}

        Please try again.
      `,
			});
			return false;
		}
	};
