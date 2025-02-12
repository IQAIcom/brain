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

		const responses = await this.processActions(actions);

		await this.callback?.({
			text: this.formatResponses(actions, responses),
		});

		return true;
	}

	private async processActions(actions: string[]) {
		const responses = [];

		for (const actionName of actions) {
			const memory = await this.createActionMemory(actionName);
			const response = await new Promise((resolve) => {
				this.runtime.processActions(
					this.message,
					[memory],
					this.state,
					resolve as HandlerCallback,
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
		const formattedSteps = responses.map(
			(response, i) => dedent`
				‎
				═══════════════════════════
				✨ Using ${actions[i].toLowerCase().replace(/_/g, " ")}
				═══════════════════════════

				${response.text}`,
		);

		return dedent`
			🎬 Task Execution Summary
			${formattedSteps.join("\n\n").trim()}
		`;
	}
}
