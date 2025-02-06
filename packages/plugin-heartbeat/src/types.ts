export interface HeartbeatTask {
	period: string; // cron style
	input: string; // human text
	client: "twitter" | "telegram";
}

export type HeartbeatPluginParams = HeartbeatTask[];
