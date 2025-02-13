import type { Action, Handler } from "@elizaos/core";
import { SequencerService } from "../services/sequencer";
import dedent from "dedent";
import type { SequencerPluginOpts } from "../types";

export const getSequencerAction = (opts: SequencerPluginOpts): Action => {
	return {
		name: "SEQUENCER",
		similes: ["SEQUENCER"],
		examples: [],
		description:
			"Evaluates the goal and determines if the query should be handled with multiple action calls",
		validate: async () => true,
		handler: handler(opts),
	};
};

const handler: (opts: SequencerPluginOpts) => Handler =
	({ plugins }) =>
	async (runtime, message, state, _options, callback) => {
		try {
			const sequencerService = new SequencerService(
				runtime,
				message,
				state,
				callback,
				plugins,
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
