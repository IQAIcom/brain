import type { Plugin } from "@elizaos/core";
import { getQuoteAction } from "./actions/get-quote";
import { swapAction } from "./actions/swap";
import { chainIdProvider } from "./providers/chainId-provider";
import type { OdosActionParams } from "./types";

export async function createOdosPlugin(
	opts: OdosActionParams,
): Promise<Plugin> {
	const actions = [getQuoteAction(opts), swapAction(opts)];

	return {
		name: "Odos Integration",
		description:
			"Odos integration plugin for swap operations or exchange tokens",
		providers: [chainIdProvider],
		evaluators: [],
		services: [],
		actions,
	};
}

export default createOdosPlugin;
