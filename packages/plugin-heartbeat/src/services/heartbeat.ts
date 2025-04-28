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
import {
	heartbeatContextTemplate,
	messageHandlerTemplate,
} from "../lib/template";
import type {
	HeartbeatClient,
	HeartbeatPluginParams,
	HeartbeatTask,
} from "../types";

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

	private async getPreviousMemories(roomId: UUID, runtime: IAgentRuntime) {
		const memories = await runtime.messageManager.getMemories({
			roomId,
		});
		return memories
			.filter((memory) => memory.userId === memory.agentId)
			.map((memory) => memory.content.text);
	}

	private async handleCron(
		heartbeatTask: HeartbeatTask,
		runtime: IAgentRuntime,
	) {
		elizaLogger.info(`🫀 Heartbeat triggered with: ${heartbeatTask.input}`);

		const userId = stringToUuid("system");
		const roomId = stringToUuid(heartbeatTask.roomName);

		await runtime.ensureConnection(
			userId,
			roomId,
			"System",
			"Heartbeat",
			"heartbeat",
		);
		const messageId = stringToUuid(Date.now().toString());
		const previousMemories = await this.getPreviousMemories(roomId, runtime);
		elizaLogger.info("Previous memories:", previousMemories);
		const content: Content = {
			text: heartbeatContextTemplate(heartbeatTask.input, previousMemories),
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
				// Early return if shouldPost exists and returns false
				if (
					heartbeatTask.shouldPost &&
					!heartbeatTask.shouldPost(response.text)
				) {
					elizaLogger.info("🚫 Skipping post based on shouldPost condition");
				} else {
					await this.handleSocialPosts(
						runtime,
						heartbeatTask,
						response.text,
						roomId,
					);
				}
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
						// Early return for the final output as well
						if (
							heartbeatTask.shouldPost &&
							!heartbeatTask.shouldPost(ctx.text)
						) {
							elizaLogger.info(
								"🚫 Skipping final post based on shouldPost condition",
							);
						} else {
							// If we're using onlyFinalOutput, this is where we send the message
							await this.handleSocialPosts(
								runtime,
								heartbeatTask,
								ctx.text,
								roomId,
							);
						}
					}
					return [memory];
				},
			);

			await runtime.evaluate(memory, state);
		}
	}

	private async handleSocialPosts(
		runtime: IAgentRuntime,
		task: HeartbeatTask,
		responseContent: string,
		roomId: string,
	) {
		// Format the content once if a formatter is provided
		let formattedContent: string;
		if (task.formatResponse) {
			formattedContent = await task.formatResponse(responseContent, runtime);
		} else {
			formattedContent = responseContent;
		}

		// Process each client in the clients array
		for (const client of task.clients) {
			await this.sendToClient(runtime, client, formattedContent, roomId);
		}
	}

	private async sendToClient(
		runtime: IAgentRuntime,
		clientConfig: HeartbeatClient,
		content: string,
		roomId: string,
	) {
		try {
			switch (clientConfig.type) {
				case "twitter": {
					const twitterClient = (runtime.clients as any)?.twitter;
					if (!twitterClient) {
						elizaLogger.warn("❌ No Twitter client found, skipping...");
						return;
					}
					await twitterClient.post.postTweet(
						runtime,
						twitterClient.post.client,
						content,
						roomId,
						content,
						twitterClient.post.twitterUsername,
					);
					break;
				}
				case "telegram": {
					const telegramClient = (runtime.clients as any)?.telegram;
					if (!telegramClient) {
						elizaLogger.warn("❌ No Telegram client found, skipping...");
						return;
					}
					await telegramClient.messageManager.bot.telegram.sendMessage(
						clientConfig.chatId,
						content,
					);
					break;
				}
				case "callback": {
					try {
						await clientConfig.callback(content, roomId);
					} catch (error) {
						elizaLogger.error(`❌ Failed to send callback: ${error}`);
					}
					break;
				}
				default: {
					elizaLogger.warn(
						`❌ Unknown client type: ${(clientConfig as any).type}`,
					);
				}
			}
		} catch (error) {
			elizaLogger.error(
				`❌ Failed to send to client ${clientConfig.type}: ${error}`,
			);
		}
	}
}
