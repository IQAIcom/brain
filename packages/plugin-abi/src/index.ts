import type { Plugin } from "@elizaos/core";
import type { AbiActionParams } from "./types";

export async function createAtpPlugin(opts: AbiActionParams): Promise<Plugin> {
	const actions = [];

	return {
		name: "ABI Plugin",
		description: "ABI plugin for generating ABI actions",
		providers: [],
		evaluators: [],
		services: [],
		actions,
	};
}

export default createAtpPlugin;
