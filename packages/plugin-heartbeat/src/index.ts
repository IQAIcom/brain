import type { Plugin } from "@elizaos/core";
import type { HeartbeatPluginParams } from "./types";
import { Heartbeat } from "./services/heartbeat";

export async function createHeartbeatPlugin(
	opts: HeartbeatPluginParams,
): Promise<Plugin> {
	return {
		name: "Heartbeat",
		description: "Provides Cron support via Service",
		providers: [],
		evaluators: [],
		services: [new Heartbeat(opts)],
	};
}

export default createHeartbeatPlugin;
