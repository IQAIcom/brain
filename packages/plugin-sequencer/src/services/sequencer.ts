import type {
	Content,
	HandlerCallback,
	IAgentRuntime,
	Memory,
	State,
} from "@elizaos/core";
import { stringToUuid } from "@elizaos/core";
import dedent from "dedent";
import { SEQUENCER_TEMPLATE } from "../lib/template";
import { InputParserService } from "./input-parser";

export class SequencerService {
	private runtime: IAgentRuntime;
	private message: Memory;
	private state: State;
	private callback: HandlerCallback;

	constructor(
		runtime: IAgentRuntime,
		message: Memory,
		state: State,
		callback: HandlerCallback,
	) {
		this.runtime = runtime;
		this.message = message;
		this.state = state;
		this.callback = callback;
	}

	async execute() {
		const inputParser = new InputParserService();
		const { actions } = (await inputParser.parseInputs({
			runtime: this.runtime,
			message: this.message,
			state: this.state,
			template: SEQUENCER_TEMPLATE,
		})) as { actions: string[] };

		await this.callback?.({
			text: dedent`
        🎯 Deduced the following actions to complete this task
        - ${actions.join("\n- ")}
      `,
			action: actions[0],
		});

		const responses = await this.processActions(actions);
		const formattedResponses = this.formatResponses(actions, responses);

		await this.callback?.({
			text: dedent`
        🎬 Here's how I completed your request step by step:
        ${formattedResponses.join("\n\n").trim()}
      `,
		});

		return true;
	}

	private async processActions(actions: string[]) {
		const responses = [];

		for (const actionName of actions) {
			const memory = await this.createActionMemory(actionName);
			const response = await new Promise((resolve: any) => {
				this.runtime.processActions(
					this.message,
					[memory],
					this.state,
					resolve,
				);
			});
			responses.push(response);
		}

		return responses;
	}

	private async createActionMemory(actionName: string): Promise<Memory> {
		const content: Content = {
			text: `Run ${actionName}`,
			action: actionName,
		};

		const memory: Memory = {
			id: stringToUuid(`${this.message.id}-${actionName}`),
			content,
			userId: this.state.userId,
			roomId: this.state.roomId,
			agentId: this.runtime.agentId,
			createdAt: Date.now(),
		};

		await this.runtime.messageManager.addEmbeddingToMemory(memory);
		await this.runtime.messageManager.createMemory(memory);

		return memory;
	}

	private formatResponses(actions: string[], responses: Content[]) {
		return responses.map((response, i) => {
			const prettyAction = actions[i].toLowerCase().replace(/_/g, " ");
			const separator = "═══════════════════════════";
			return dedent`
        ‎
        ${separator}
        ✨ Using ${prettyAction}
        ${separator}

        ${response.text}`;
		});
	}
}
