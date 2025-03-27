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
import dedent from "dedent";
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

		this.saveToMemory(
			"We decided to call series of actions based on user request",
		);

		const output = await generateText({
			runtime: this.runtime,
			modelClass: ModelClass.LARGE,
			context: this.memory.content.text,
			customSystemPrompt:
				"You are a Sequencer. Understand the user's request and answer with help of available tools at your disposal. Continue querying tools until you have a complete answer.",
			maxSteps: 10,
			tools: Object.fromEntries(
				actions.map((a) => [
					a.name,
					{
						parameters: z.object({
							reason: z
								.string()
								.describe(
									"Reason for using this tool. If there is any error from previous action, provide the error message.",
								),
						}),
						description: a.description,
						execute: ({ reason }) =>
							this.handlerWrapper(a.name, a.handler, reason),
					},
				]),
			),
		});

		this.callback({
			text: output,
		});
	}

	private async handlerWrapper(name: string, handler: Handler, reason: string) {
		elizaLogger.info(`\n🔄 Executing handler: ${name}...`);

		// Save action execution to memory using the helper method
		await this.saveToMemory(
			dedent`## Action Execution
							**Action:** ${name}
							**Reason:** ${reason}`,
			`action-${name}-start`,
		);
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

		// Save action result to memory using the helper method
		await this.saveToMemory(
			dedent`## Action Result
							**Action:** ${name}
							**Status:** Completed
							**Result:**
							\`\`\`
							${text}
							\`\`\``,
			`action-${name}-result`,
		);

		return text;
	}

	private async saveToMemory(text: string, suffix = "memory") {
		const memoryId = stringToUuid(`${this.memory.id}-${suffix}`);
		await this.runtime.messageManager.createMemory({
			id: memoryId,
			content: { text },
			userId: this.runtime.agentId,
			roomId: this.state.roomId,
			agentId: this.runtime.agentId,
			createdAt: Date.now(),
			embedding: getEmbeddingZeroVector(),
		});
		return memoryId;
	}
}
