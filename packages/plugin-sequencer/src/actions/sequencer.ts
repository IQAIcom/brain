import type { Action, Handler } from "@elizaos/core";
import dedent from "dedent";
import { SequencerService } from "../services/sequencer";

export const getSequencerAction = (): Action => {
	return {
		name: "SEQUENCER",
		similes: [
			"SEQUENCER",
			"SEQUENCE",
			"CHAIN",
			"ORCHESTRATE",
			"COORDINATE",
			"MULTI_STEP",
			"PIPELINE",
		],
		examples: [],
		description: dedent`
			Select this action when the user's request requires multiple action calls
			to be fully addressed. This handles complex queries by breaking them down
			into a sequence of individual actions that work together to achieve the
			desired result.
		`,
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
