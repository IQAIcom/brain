import type { Plugin } from "@elizaos/core";
import { getSequencerAction } from "./actions/sequencer";
import type { SequencerPluginOpts } from "./types";

export async function createSequencerPlugin(
	opts: SequencerPluginOpts,
): Promise<Plugin> {
	return {
		name: "Sequencer",
		description:
			"Provides support for running sequences of actions for a query",
		providers: [],
		actions: [getSequencerAction(opts)],
		services: [],
	};
}

export default createSequencerPlugin;
