import { getQuoteAction } from "./actions/get-quote";
import { swapAction } from "./actions/swap";
import type { OdosActionParams } from "./types";
import type { Plugin } from "@elizaos/core";
import { chainIdProvider } from "./providers/chainId-provider";

export async function createOdosPlugin(
	opts: OdosActionParams,
): Promise<Plugin> {
	const actions = [
		getQuoteAction(opts),
		swapAction(opts),
	];

	return {
		name: "Odos Integration",
		description: "Odos integration plugin for swap operations or exchange tokens",
		providers: [chainIdProvider],
		evaluators: [],
		services: [],
		actions,
	};
}

export default createOdosPlugin;
