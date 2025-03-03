import type { Action, Handler } from "@elizaos/core";
import type { BridgeMonitorService } from "../services/bridge-monitor";

export const monitorBridgeAction = (
	bridgeMonitorService: BridgeMonitorService,
): Action => {
	return {
		name: "IQ_BRIDGE_MONITOR",
		description: "Information about the IQ bridge monitoring service",
		similes: [
			"MONITOR_BRIDGE",
			"BRIDGE_MONITOR",
			"WATCH_BRIDGE",
			"BRIDGE_INFO",
		],
		validate: async () => true,
		handler: handler(bridgeMonitorService),
		examples: [],
	};
};

const handler: (bridgeMonitorService: BridgeMonitorService) => Handler =
	(bridgeMonitorService) =>
	async (_runtime, _message, _state, _options, callback) => {
		try {
			callback?.({
				text: "The IQ bridge monitor is running and automatically funding users who bridge IQ tokens to Fraxtal. It monitors the L1 Standard Bridge (0x34c0bd5877a5ee7099d0f5688d65f4bb9158bde2) for deposits of 1500+ IQ tokens and sends 0.0001 ETH to users who need it.",
			});
			return true;
		} catch (error) {
			callback?.({
				text: `❌ Error with bridge monitor: ${error.message}`,
			});
			return false;
		}
	};
