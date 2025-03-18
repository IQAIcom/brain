import type { Plugin } from "@elizaos/core";
import { getWikiAction } from "./actions/get-wiki";
import { getUserWikisAction } from "./actions/get-latest-wikis";

export async function createWikiPlugin(): Promise<Plugin> {
	const actions = [getWikiAction(), getUserWikisAction()];

	return {
		name: "IQ Wiki Integration",
		description:
			"IQ Wiki integration plugin for retrieving key blockchain information",
		providers: [],
		evaluators: [],
		services: [],
		actions,
	};
}

export default createWikiPlugin;
