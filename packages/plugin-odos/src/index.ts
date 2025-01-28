import { getQuoteAction } from "./actions/get-quote";
import type { OdosActionParams } from "./types";
import type { Plugin } from "@elizaos/core";

export async function createOdosPlugin(
	opts: OdosActionParams,
): Promise<Plugin> {
	const actions = [
		getQuoteAction(opts),
	];

	return {
		name: "Odos Integration",
		description: "Odos integration plugin for swap operations or exchange tokens",
		providers: [],
		evaluators: [],
		services: [],
		actions,
	};
}

export default createOdosPlugin;
