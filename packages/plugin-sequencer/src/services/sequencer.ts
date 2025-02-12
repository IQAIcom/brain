import type { Action, Handler } from "@elizaos/core";
import { InputParserService } from "./input-parser";
import { SEQUENCER_TEMPLATE } from "../lib/template";
import dedent from "dedent";
import type { Memory } from "@elizaos/core";

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
		const inputParser = new InputParserService();
		const { actions } = (await inputParser.parseInputs({
			runtime,
			message,
			state,
			template: SEQUENCER_TEMPLATE,
		})) as { actions: string[] };

		await callback?.({
			text: dedent`
				🎯 Deduced the following actions to complete this task
				- ${actions.join("\n- ")}
			`,
			action: actions[0],
		});

		for (const actionName of actions) {
			const newMemory: Memory = {
				agentId: state.agentId,
				roomId: state.roomId,
				userId: state.userId,
				content: {
					text: `Run ${actionName}`,
					action: actionName,
				},
			};
			await runtime.processActions(message, [newMemory], state, callback);
		}
	};
