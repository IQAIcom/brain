import {
	type Content,
	type Handler,
	type HandlerCallback,
	type IAgentRuntime,
	type Memory,
	ModelClass,
	type State,
	elizaLogger,
	generateText,
	stringToUuid,
} from "@elizaos/core";
import { z } from "zod";

export class SequencerService {
	private runtime: IAgentRuntime;
	private memory: Memory;
	private state: State;
	private callback: HandlerCallback;

	constructor(
		runtime: IAgentRuntime,
		message: Memory,
		state: State,
		callback: HandlerCallback,
	) {
		this.runtime = runtime;
		this.memory = message;
		this.state = state;
		this.callback = callback;
	}

	async execute() {
		elizaLogger.info(
			`ℹ️ All Actions names: ${this.runtime.actions.map((a) => a?.name)}`,
		);

		const output = await generateText({
			runtime: this.runtime,
			modelClass: ModelClass.LARGE,
			context: this.memory.content.text,
			maxSteps: 4,
			tools: Object.fromEntries(
				this.runtime.actions.map((a) => [
					a.name,
					{
						parameters: z.object({}),
						description: a.description,
						execute: () => this.handlerWrapper(a.name, a.handler),
					},
				]),
			),
		});

		this.callback({
			text: output,
		});
	}

	private async handlerWrapper(name: string, handler: Handler) {
		elizaLogger.info(`\n🔄 Executing handler: ${name}...`);
		const { text } = (await new Promise((resolve) =>
			handler(this.runtime, this.memory, this.state, null, resolve as any),
		)) as Content;
		await this.createActionMemory(text);
		return text;
	}

	private async createActionMemory(text: string) {
		await this.runtime.messageManager.createMemory({
			id: stringToUuid(`${this.memory.id}-${text}`),
			content: {
				text: text,
			},
			userId: this.state.userId,
			roomId: this.state.roomId,
			agentId: this.runtime.agentId,
			createdAt: Date.now(),
		});
		await this.runtime.updateRecentMessageState(this.state);
	}
}
