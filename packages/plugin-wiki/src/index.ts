import type { Plugin } from "@elizaos/core";
import { getWikiAction } from "./actions/get-wiki";
import { getUserCreatedWikisAction } from "./actions/get-created-wikis";
import { getUserEditedWikisAction } from "./actions/get-edited-wikis";
import { getUserWikiActivitiesAction } from "./actions/get-wiki-activities";
export async function createWikiPlugin(): Promise<Plugin> {
	const actions = [
		getWikiAction(),
		getUserCreatedWikisAction(),
		getUserEditedWikisAction(),
		getUserWikiActivitiesAction(),
	];

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
