import type { Plugin } from "@elizaos/core";
import { getLoopEvaluator } from "./services/looper";
import { getSequencerAction } from "./services/sequencer";

export async function createSequencerPlugin(): Promise<Plugin> {
	return {
		name: "Sequencer",
		description:
			"Provides support for running sequences of actions for a query",
		providers: [],
		evaluators: [getLoopEvaluator()],
		actions: [getSequencerAction()],
		services: [],
	};
}

export default createSequencerPlugin;
