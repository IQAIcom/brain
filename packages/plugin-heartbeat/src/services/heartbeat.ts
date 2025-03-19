import {
	type Content,
	type IAgentRuntime,
	type Memory,
	ModelClass,
	Service,
	ServiceType,
	composeContext,
	elizaLogger,
	generateMessageResponse,
	getEmbeddingZeroVector,
	stringToUuid,
} from "@elizaos/core";
import * as cron from "node-cron";
import { messageHandlerTemplate } from "../lib/template";
import type { HeartbeatPluginParams, HeartbeatTask } from "../types";

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
		const roomId = stringToUuid(`heartbeat-room-${heartbeatTask.input}`);

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

			// Only send the initial response if we're not waiting for final output
			if (!heartbeatTask.onlyFinalOutput) {
				await this.handleSocialPost(
					runtime,
					heartbeatTask,
					response.text,
					roomId,
				);
			}

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
				async (ctx) => {
					if (ctx.text) {
						// If we're using onlyFinalOutput, this is where we send the message
						await this.handleSocialPost(
							runtime,
							heartbeatTask,
							ctx.text,
							roomId,
						);
					}
					return [memory];
				},
			);

			await runtime.evaluate(memory, state);
		}
	}

	private async handleSocialPost(
		runtime: IAgentRuntime,
		task: HeartbeatTask,
		responseContent: string,
		roomId: string,
	) {
		const client = runtime.clients?.[task.client];
		if (!client && task.client !== "callback") {
			elizaLogger.warn(
				`❌ No client found for task: ${task.client}, skipping...`,
			);
			return;
		}

		// Apply format function if provided
		const formattedContent = task.formatResponse
			? task.formatResponse(responseContent)
			: responseContent;

		switch (task.client) {
			case "twitter": {
				await client.post.postTweet(
					runtime,
					client.post.client,
					formattedContent,
					roomId,
					formattedContent,
					client.post.twitterUsername,
				);
				break;
			}
			case "telegram": {
				await client.messageManager.bot.telegram.sendMessage(
					task.config.chatId,
					formattedContent,
				);
				break;
			}
			case "callback": {
				try {
					await task.config.callback(formattedContent, roomId);
				} catch (error) {
					elizaLogger.error(`❌ Failed to send callback: ${error}`);
				}
				break;
			}
		}
	}
}
