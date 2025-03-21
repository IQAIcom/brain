import type { Plugin } from "@elizaos/core";
import { getSequencerAction } from "./actions/sequencer";

export async function createSequencerPlugin(): Promise<Plugin> {
	return {
		name: "Sequencer",
		description:
			"Provides support for running sequences of actions for a query",
		providers: [],
		actions: [getSequencerAction()],
		services: [],
	};
}

export default createSequencerPlugin;
