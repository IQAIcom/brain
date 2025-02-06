import {
	type Content,
	type IAgentRuntime,
	type Memory,
	ModelClass,
	Service,
	composeContext,
	elizaLogger,
	generateMessageResponse,
	getEmbeddingZeroVector,
	stringToUuid,
} from "@elizaos/core";
import * as cron from "node-cron";
import type { HeartbeatPluginParams } from "../types";
import { messageHandlerTemplate } from "../lib/template";

export class Heartbeat extends Service {
	constructor(private readonly opts: HeartbeatPluginParams) {
		super();
	}

	async initialize(runtime: IAgentRuntime) {
		for (const heartbeat of this.opts) {
			cron.schedule(heartbeat.period, () =>
				this.handleCron(heartbeat.trigger, runtime),
			);
		}
		elizaLogger.info("ℹ️ Heartbeat service initialized with scheduled tasks");
	}

	private async handleCron(trigger: string, runtime: IAgentRuntime) {
		elizaLogger.info(`🫀 Heartbeat triggered with: ${trigger}`);

		const userId = stringToUuid("system");
		const roomId = stringToUuid("heartbeat-room");

		await runtime.ensureConnection(
			userId,
			roomId,
			"System",
			"Heartbeat",
			"heartbeat",
		);

		const messageId = stringToUuid(Date.now().toString());

		const content: Content = {
			text: trigger,
			attachments: [],
			source: "heartbeat",
			inReplyTo: undefined,
		};

		elizaLogger.info("📥 Processing heartbeat message:", content);

		const userMessage = {
			content,
			userId,
			roomId,
			agentId: runtime.agentId,
		};

		const memory: Memory = {
			id: stringToUuid(`${messageId}-${userId}`),
			...userMessage,
			agentId: runtime.agentId,
			userId,
			roomId,
			content,
			createdAt: Date.now(),
		};

		await runtime.messageManager.addEmbeddingToMemory(memory);
		await runtime.messageManager.createMemory(memory);

		let state = await runtime.composeState(userMessage, {
			agentName: runtime.character.name,
		});

		const context = composeContext({
			state,
			template: messageHandlerTemplate,
		});

		const response = await generateMessageResponse({
			runtime: runtime,
			context,
			modelClass: ModelClass.LARGE,
		});

		if (response) {
			elizaLogger.info("📤 Heartbeat response generated:", response);

			const responseMessage: Memory = {
				id: stringToUuid(`${messageId}-${runtime.agentId}`),
				...userMessage,
				userId: runtime.agentId,
				content: response,
				embedding: getEmbeddingZeroVector(),
				createdAt: Date.now(),
			};

			await runtime.messageManager.createMemory(responseMessage);
			state = await runtime.updateRecentMessageState(state);

			elizaLogger.info(`✅ Heartbeat cycle completed for trigger: ${trigger}`);

			await runtime.processActions(
				memory,
				[responseMessage],
				state,
				async () => [memory],
			);

			await runtime.evaluate(memory, state);
		}
	}
}
