import {
	type Content,
	type Handler,
	type HandlerCallback,
	type IAgentRuntime,
	type Memory,
	ModelClass,
	type Plugin,
	type State,
	generateText,
} from "@elizaos/core";
import dedent from "dedent";
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
		console.log(`\n🔄 Executing handler: ${name}...`);
		const { text } = (await new Promise((resolve) =>
			handler(this.runtime, this.memory, this.state, null, resolve as any),
		)) as Content;
		console.log(`✨ Handler ${name} completed successfully`);
		console.log(`📝 Output: ${text}\n`);
		this.memory.content.text = dedent`
			${this.memory.content.text}
			## Response from ${name}:
			${text}
		`;
		return text;
	}
}
