import type { Plugin } from "@elizaos/core";
import { monitorBridgeAction } from "./actions/bridge-monitor";
import { BridgeMonitorService } from "./services/bridge-monitor";
import type { IQBridgeMonitorParams } from "./types";
import {
	IQ_ADDRESSES,
	BRIDGE_ADDRESS,
	FUNDING_AMOUNT,
	MIN_IQ_THRESHOLD,
} from "./lib/constants";
import { mainnet, fraxtal } from "viem/chains";

export async function createIQBridgeMonitorPlugin(
	opts: IQBridgeMonitorParams,
): Promise<Plugin> {
	const bridgeMonitorService = new BridgeMonitorService();

	await bridgeMonitorService.startMonitoring();

	return {
		name: "IQ Bridge Monitor",
		description:
			"Monitors IQ token bridge transactions and funds Fraxtal addresses with frxETH",
		providers: [],
		evaluators: [],
		services: [],
		actions: [monitorBridgeAction(bridgeMonitorService)],
	};
}

export default createIQBridgeMonitorPlugin;
