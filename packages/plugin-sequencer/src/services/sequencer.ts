import type { Action, Handler } from "@elizaos/core";
import { InputParserService } from "./input-parser";
import { SEQUENCER_TEMPLATE } from "../lib/template";
import dedent from "dedent";
import type { Memory } from "@elizaos/core";
import { stringToUuid } from "@elizaos/core";
import type { Content } from "@elizaos/core";

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

		const responses = [];

		for (const actionName of actions) {
			const content: Content = {
				text: `Run ${actionName}`,
				action: actionName,
			};
			const userMessage = {
				content,
				userId: state.userId,
				roomId: state.roomId,
				agentId: runtime.agentId,
			};

			const memory: Memory = {
				id: stringToUuid(`${message.id}-${actionName}`),
				...userMessage,
				createdAt: Date.now(),
			};
			await runtime.messageManager.addEmbeddingToMemory(memory);
			await runtime.messageManager.createMemory(memory);
			const response = await new Promise((resolve: any) => {
				runtime.processActions(message, [memory], state, resolve);
			});
			responses.push(response);
		}

		const formattedResponses = responses.map((response, i) => {
			const prettyAction = actions[i].toLowerCase().replace(/_/g, " ");
			const separator = "═══════════════════════════";
			return dedent`
				‎
				${separator}
				✨ Using ${prettyAction}
				${separator}

				${response.text}`;
		});

		const summaryText = dedent`
			🎬 Here's how I completed your request step by step:
			${formattedResponses.join("\n\n").trim()}
		`;

		await callback?.({
			text: summaryText,
		});
	};
