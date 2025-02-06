import {
	type Content,
	type IAgentRuntime,
	type Memory,
	ModelClass,
	Service,
	ServiceType,
	type UUID,
	composeContext,
	elizaLogger,
	generateMessageResponse,
	getEmbeddingZeroVector,
	stringToUuid,
} from "@elizaos/core";
import * as cron from "node-cron";
import type { HeartbeatPluginParams, HeartbeatTask } from "../types";
import { messageHandlerTemplate } from "../lib/template";

export class Heartbeat extends Service {
	static serviceType: ServiceType = ServiceType.TRANSCRIPTION;

	constructor(private readonly opts: HeartbeatPluginParams) {
		super();
	}

	async initialize(runtime: IAgentRuntime) {
		for (const heartbeatTask of this.opts) {
			cron.schedule(heartbeatTask.period, () =>
				this.handleCron(heartbeatTask, runtime),
			);
		}
		elizaLogger.info("ℹ️ Heartbeat service initialized with scheduled tasks");
	}

	private async handleCron(
		heartbeatTask: HeartbeatTask,
		runtime: IAgentRuntime,
	) {
		elizaLogger.info(`🫀 Heartbeat triggered with: ${heartbeatTask.input}`);

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
			text: heartbeatTask.input,
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
			await this.handleSocialPost(
				runtime,
				heartbeatTask,
				response.text,
				roomId,
			);

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

			elizaLogger.info(
				`✅ Heartbeat cycle completed for trigger: ${heartbeatTask.input}`,
			);

			await runtime.processActions(
				memory,
				[responseMessage],
				state,
				async () => [memory],
			);

			await runtime.evaluate(memory, state);
		}
	}

	private async handleSocialPost(
		runtime: IAgentRuntime,
		task: HeartbeatTask,
		responseContent: string,
		roomId: UUID,
	) {
		switch (task.client) {
			case "twitter":
				if (runtime.clients?.twitter) {
					await runtime.clients.twitter.postTweet(
						runtime,
						task.input,
						roomId,
						responseContent,
						runtime.character.name,
					);
				}
				break;
			case "telegram":
				if (runtime.clients?.telegram) {
					//TODO: Telegram implementation when ready
				}
				break;
		}
	}
}
