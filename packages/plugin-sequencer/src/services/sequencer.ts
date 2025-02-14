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
		const actions = this.runtime.actions.filter((a) => a.name !== "SEQUENCER");
		elizaLogger.info(`ℹ️ All Actions names: ${actions.map((a) => a?.name)}`);

		const output = await generateText({
			runtime: this.runtime,
			modelClass: ModelClass.LARGE,
			context: this.memory.content.text,
			maxSteps: 4,
			tools: Object.fromEntries(
				actions.map((a) => [
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
		const { text } = await new Promise<Content>((resolve) =>
			handler(
				this.runtime,
				this.memory,
				this.state,
				null,
				resolve as HandlerCallback,
			),
		);
		await this.runtime.messageManager.createMemory({
			id: stringToUuid(`${this.memory.id}-${text}`),
			content: { text },
			userId: this.memory.userId,
			roomId: this.state.roomId,
			agentId: this.runtime.agentId,
			createdAt: Date.now(),
		});
		return text;
	}
}
