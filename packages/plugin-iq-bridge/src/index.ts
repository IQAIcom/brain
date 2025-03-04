import type { Plugin } from "@elizaos/core";
import { monitorBridgeAction } from "./actions/bridge-monitor";
import { BridgeMonitorService } from "./services/bridge-monitor";
import type { IQBridgeMonitorParams } from "./types";

export async function createIQBridgeMonitorPlugin(
	opts: IQBridgeMonitorParams,
): Promise<Plugin> {
	if (!opts.funderPrivateKey) {
		throw new Error("Funder private key is required for IQ Bridge Monitor");
	}

	const bridgeMonitorService = new BridgeMonitorService(opts.funderPrivateKey);

	await bridgeMonitorService.startMonitoring();

	return {
		name: "IQ Bridge Monitor",
		description:
			"Monitors IQ token bridge transactions and funds Fraxtal addresses with ETH",
		providers: [],
		evaluators: [],
		services: [],
		actions: [monitorBridgeAction(bridgeMonitorService)],
	};
}

export default createIQBridgeMonitorPlugin;
