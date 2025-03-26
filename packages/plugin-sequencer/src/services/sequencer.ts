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
	getEmbeddingZeroVector,
	stringToUuid,
} from "@elizaos/core";
import { z } from "zod";

export class SequencerService {
	constructor(
		private runtime: IAgentRuntime,
		private memory: Memory,
		private state: State,
		private callback: HandlerCallback,
	) {}

	async execute() {
		const actions = this.runtime.actions.filter((a) => a.name !== "SEQUENCER");
		elizaLogger.info(`ℹ️ All Actions names: ${actions.map((a) => a?.name)}`);

		const output = await generateText({
			runtime: this.runtime,
			modelClass: ModelClass.LARGE,
			context: this.memory.content.text,
			customSystemPrompt:
				"You are a Sequencer. Understand the user's request and answer with help of available tools at your disposal.",
			maxSteps: 10,
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
		elizaLogger.info(`✅ Handler executed: ${name}`, { text });
		await this.runtime.messageManager.createMemory({
			id: stringToUuid(`${this.memory.id}-${text}`),
			content: { text },
			userId: this.memory.userId,
			roomId: this.state.roomId,
			agentId: this.runtime.agentId,
			createdAt: Date.now(),
			embedding: getEmbeddingZeroVector(),
		});
		return text;
	}
}
