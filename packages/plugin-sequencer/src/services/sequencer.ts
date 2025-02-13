import {
	composeContext,
	generateText,
	type Handler,
	ModelClass,
	type Plugin,
	type HandlerCallback,
	type IAgentRuntime,
	type Memory,
	type State,
	elizaLogger,
} from "@elizaos/core";
import { CONTEXT_MESSAGE } from "../lib/template";
import { z } from "zod";

export class SequencerService {
	private runtime: IAgentRuntime;
	private memory: Memory;
	private state: State;
	private callback: HandlerCallback;
	private plugins: Plugin[];

	constructor(
		runtime: IAgentRuntime,
		message: Memory,
		state: State,
		callback: HandlerCallback,
		plugins: Plugin[],
	) {
		this.runtime = runtime;
		this.memory = message;
		this.state = state;
		this.callback = callback;
		this.plugins = plugins;
	}

	async execute() {
		const actions = this.plugins.flatMap((p) => p.actions).filter(Boolean);
		console.log(`ℹ️ All Actions names: ${actions.map((a) => a?.name)}`);

		const output = await generateText({
			runtime: this.runtime,
			modelClass: ModelClass.LARGE,
			context: this.memory.content.text,
			maxSteps: 4,
			tools: Object.fromEntries(
				actions.map((a) => [
					a.name,
					{
						parameters: z.object({}),
						description: a.description,
						execute: () => this.handlerWrapper(a.name, a.handler),
					},
				]),
			),
		});

		this.callback({
			text: output,
		});
	}

	private async handlerWrapper(name: string, handler: Handler) {
		console.log(`ℹ️ Executing handler: ${name}`);
		const data = (await new Promise((resolve) =>
			handler(this.runtime, this.memory, this.state, null, resolve as any),
		)) as Memory;
		console.log(`✅ Handler executed: ${name}`);
		this.memory.content.text = this.memory.content.text + data.content.text;
	}
}
