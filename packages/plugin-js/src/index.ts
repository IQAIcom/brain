import type { Plugin } from "@elizaos/core";
import { getExecuteJsAction } from "./actions/execute";
import type { JsPluginOptions } from "./types";

export async function createJsPlugin(
	options: JsPluginOptions = {},
): Promise<Plugin> {
	const plugin: Plugin = {
		name: "plugin-js",
		description:
			"Plugin that allows secure execution of JavaScript code in an isolated environment",
		actions: [
			getExecuteJsAction({
				memoryLimit: options.memoryLimit || 128,
				timeout: options.timeout || 5000,
			}),
		],
	};
	return plugin;
}
