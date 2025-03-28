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

	private async handleCron(
		heartbeatTask: HeartbeatTask,
		runtime: IAgentRuntime,
	) {
		const userId = stringToUuid("system");
		const roomId = stringToUuid(`heartbeat-room-${heartbeatTask.input}`);
		elizaLogger.info("🔔 Heartbeat triggered for room id:", roomId);

		await runtime.ensureConnection(
			userId,
			roomId,
			"System",
			"Heartbeat",
			"heartbeat",
		);

		const messageId = stringToUuid(Date.now().toString());

		// Get all previous messages from this room
		const allRoomMessages = await runtime.messageManager.getMemories({
			roomId: roomId,
		});

		// Filter to get only the agent's responses
		const previousAgentResponses = allRoomMessages.filter(
			(memory) => memory.userId === runtime.agentId,
		);

		// Format the previous responses for the template
		const formattedPreviousResponses = previousAgentResponses
			.map((m) => m.content.text)
			.join("\n\n");

		const content: Content = {
			text: heartbeatContextTemplate(heartbeatTask.input),
			attachments: [],
			source: "heartbeat",
			inReplyTo: undefined,
		};

		const userMessage = {
			content,
			userId,
			roomId,
			agentId: runtime.agentId,
		};

		// Create user memory using the helper method
		const memory = await this.createMemory({
			id: stringToUuid(`${messageId}-${userId}`),
			...userMessage,
			agentId: runtime.agentId,
			createdAt: Date.now(),
			runtime,
		});

		// Fetch previous room messages if preventRepetition is enabled
		let previousMessages: string[] = [];
		if (heartbeatTask.preventRepetition) {
			const roomContent = await runtime.messageManager.getMemories({
				roomId: roomId,
			});

			// Extract agent responses only (excluding system messages)
			previousMessages = roomContent
				.filter((m) => m.userId === runtime.agentId)
				.map((m) => m.content.text);

			elizaLogger.info(
				"📚 Previous messages loaded for repetition prevention:",
				previousMessages.length,
			);
		}

		let state = await runtime.composeState(userMessage, {
			agentName: runtime.character.name,
		});

		// Add previous responses to state
		if (previousAgentResponses.length > 0) {
			state = {
				...state,
				previousResponses: formattedPreviousResponses,
			};
		}

		const context = composeContext({
			state,
			template: messageHandlerTemplate,
			templatingEngine: "handlebars",
		});

		elizaLogger.info("🧠 Context generated:", context);

		const response = await generateMessageResponse({
			runtime: runtime,
			context,
			modelClass: ModelClass.LARGE,
		});

		if (response) {
			elizaLogger.info("📤 Heartbeat response generated:", response);

			// Display room content for debugging
			const roomContent = await runtime.messageManager.getMemories({
				roomId: roomId,
			});
			elizaLogger.info(
				"Existing room messages: ",
				roomContent
					.map(
						(m) => `
					Message: ${JSON.stringify(m.content, null, 2)}
					User:  ${m.userId}
				`,
					)
					.join("\n\n"),
			);

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

			// Create response memory using the helper method
			const responseMessage = await this.createMemory({
				id: stringToUuid(`${messageId}-${runtime.agentId}`),
				...userMessage,
				userId: runtime.agentId,
				content: response,
				embedding: getEmbeddingZeroVector(),
				createdAt: Date.now(),
				skipEmbedding: true, // Skip embedding since we're setting it directly
				runtime,
			});

			state = await runtime.updateRecentMessageState(state);

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

	/**
	 * Helper method to create and store memory objects
	 */
	private async createMemory({
		id,
		content,
		userId,
		roomId,
		agentId,
		createdAt,
		embedding,
		skipEmbedding = false,
		runtime,
	}: {
		// Use proper UUID types
		id: `${string}-${string}-${string}-${string}-${string}`;
		content: Content;
		userId: `${string}-${string}-${string}-${string}-${string}`;
		roomId: `${string}-${string}-${string}-${string}-${string}`;
		agentId: `${string}-${string}-${string}-${string}-${string}`;
		createdAt: number;
		embedding?: number[];
		skipEmbedding?: boolean;
		runtime: IAgentRuntime;
	}): Promise<Memory> {
		const memory: Memory = {
			id,
			content,
			userId,
			roomId,
			agentId,
			createdAt,
			embedding,
		};

		if (!skipEmbedding) {
			await runtime.messageManager.addEmbeddingToMemory(memory);
		}

		await runtime.messageManager.createMemory(memory);
		return memory;
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
