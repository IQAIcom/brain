import type { Plugin } from "@elizaos/core";

export async function createSequencerPlugin(): Promise<Plugin> {
	return {
		name: "Sequencer",
		description:
			"Provides support for running sequences of actions for a query",
		providers: [],
		evaluators: [],
		services: [],
	};
}

export default createSequencerPlugin;
