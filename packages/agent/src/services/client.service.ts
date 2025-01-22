import { DirectClient } from "@elizaos/client-direct";
import { TelegramClientInterface } from "@elizaos/client-telegram";
import { TwitterClientInterface } from "@elizaos/client-twitter";
import type { AgentRuntime, IAgentRuntime } from "@elizaos/core";
import type { ClientConfig } from "../types";

export async function setupClientInterfaces(
  runtime: IAgentRuntime,
  config?: ClientConfig
) {
  const clients: Record<string, any> = {};

  if (config?.direct?.enabled) {
    const directClient = new DirectClient();
    const serverPort = config.direct.port || 3000;
    directClient.start(serverPort);
    directClient.registerAgent(runtime as AgentRuntime);
    clients.direct = directClient;
  }

  if (config?.telegram?.token) {
    const telegramClient = await TelegramClientInterface.start(runtime);
    if (telegramClient) clients.telegram = telegramClient;
  }

  if (config?.twitter?.username && config?.twitter?.password) {
    const twitterClient = await TwitterClientInterface.start(runtime);
    if (twitterClient) clients.twitter = twitterClient;
  }

  return clients;
}
