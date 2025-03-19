export interface BaseHeartbeatTask {
	period: string;
	input: string;
	onlyFinalOutput?: boolean;
	formatResponse?: (response: string) => string;
}

export interface TwitterHeartbeatTask extends BaseHeartbeatTask {
	client: "twitter";
}

export interface TelegramHeartbeatTask extends BaseHeartbeatTask {
	client: "telegram";
	config: {
		chatId: string;
	};
}

export interface CallbackHeartbeatTask extends BaseHeartbeatTask {
	client: "callback";
	config: {
		callback: (content: string, roomId: string) => Promise<void>;
	};
}

export type HeartbeatTask =
	| TwitterHeartbeatTask
	| TelegramHeartbeatTask
	| CallbackHeartbeatTask;

export type HeartbeatPluginParams = HeartbeatTask[];
