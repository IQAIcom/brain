export interface BaseHeartbeatTask {
	period: string;
	input: string;
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

export type HeartbeatTask = TwitterHeartbeatTask | TelegramHeartbeatTask;

export type HeartbeatPluginParams = HeartbeatTask[];
