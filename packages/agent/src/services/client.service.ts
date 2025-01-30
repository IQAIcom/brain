import { DirectClient } from "@elizaos/client-direct";
import { TelegramClientInterface } from "@elizaos/client-telegram";
import { TwitterClientInterface } from "@elizaos/client-twitter";
import type { AgentRuntime, IAgentRuntime } from "@elizaos/core";
import type { ClientConfig } from "../types";

export class ClientService {
	private clients: Record<string, any> = {};

	constructor(
		private runtime: IAgentRuntime,
		private config?: ClientConfig,
	) {}

	public async init() {
		if (this.config?.direct?.enabled) {
			const directClient = new DirectClient();
			const serverPort = this.config.direct.port || 3000;
			directClient.start(serverPort);
			directClient.registerAgent(this.runtime as AgentRuntime);
			this.clients.direct = directClient;
		}

		if (this.config?.telegram?.token) {
			const telegramClient = await TelegramClientInterface.start(this.runtime);
			if (telegramClient) this.clients.telegram = telegramClient;
		}

		if (this.config?.twitter?.username && this.config?.twitter?.password) {
			const twitterClient = await TwitterClientInterface.start(this.runtime);
			if (twitterClient) this.clients.twitter = twitterClient;
		}

		return this.clients;
	}
}
