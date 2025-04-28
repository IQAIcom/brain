import type { IAgentRuntime } from "@elizaos/core";

export interface HeartbeatTask {
	period: string;
	input: string;
	roomName: string;
	onlyFinalOutput?: boolean;
	shouldPost?: (response: string) => boolean;
	formatResponse?: (
		response: string,
		runtime: IAgentRuntime,
	) => Promise<string>;
	clients: HeartbeatClient[];
}

// Define client configurations
export interface TwitterClientConfig {
	type: "twitter";
}

export interface TelegramClientConfig {
	type: "telegram";
	chatId: string;
}

export interface CallbackClientConfig {
	type: "callback";
	callback: (content: string, roomId: string) => Promise<void>;
}

export type HeartbeatClient =
	| TwitterClientConfig
	| TelegramClientConfig
	| CallbackClientConfig;

export type HeartbeatPluginParams = HeartbeatTask[];
