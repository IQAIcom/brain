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
	private handlerLock: Promise<void> = Promise.resolve();
	private handlerQueue: Array<{
		name: string;
		handler: Handler;
		reason: string;
		resolve: (result: string) => void;
	}> = [];
	private isProcessingQueue = false;

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
						execute: async ({ reason }) => {
							return await this.queueHandler(a.name, a.handler, reason);
						},
					},
				]),
			),
		});

		await this.handlerLock;

		this.callback({
			text: output,
		});
	}

	private async queueHandler(
		name: string,
		handler: Handler,
		reason: string,
	): Promise<string> {
		return new Promise<string>((resolve) => {
			this.handlerQueue.push({ name, handler, reason, resolve });
			elizaLogger.info(`\n📋 Queued handler: ${name}`);

			if (!this.isProcessingQueue) {
				this.processQueue();
			}
		});
	}

	private async processQueue() {
		if (this.isProcessingQueue || this.handlerQueue.length === 0) {
			return;
		}

		this.isProcessingQueue = true;

		while (this.handlerQueue.length > 0) {
			const { name, handler, reason, resolve } = this.handlerQueue.shift();

			let releaseLock: () => void;
			this.handlerLock = new Promise<void>((r) => {
				releaseLock = r;
			});

			try {
				elizaLogger.info(`\n🔒 Processing queued handler: ${name}`);
				const result = await this.handlerWrapper(name, handler, reason);
				resolve(result);
			} catch (error) {
				elizaLogger.error(`Error executing handler ${name}:`, error);
				resolve(`Error executing ${name}: ${error.message || "Unknown error"}`);
			} finally {
				releaseLock();
			}
		}

		this.isProcessingQueue = false;
	}

	private async handlerWrapper(name: string, handler: Handler, reason: string) {
		elizaLogger.info(`\n🔄 Executing handler: ${name}...`);

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
		const random = Date.now() + Math.random() * 1000;
		const memoryId = stringToUuid(`${this.memory.id}-${suffix}-${random}`);
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
