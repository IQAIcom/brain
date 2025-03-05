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

export interface WebhookHeartbeatTask extends BaseHeartbeatTask {
	client: "webhook";
	config: {
		url: string;
	};
}

export type HeartbeatTask =
	| TwitterHeartbeatTask
	| TelegramHeartbeatTask
	| WebhookHeartbeatTask;

export type HeartbeatPluginParams = HeartbeatTask[];
