import type { AgentRuntime } from "@elizaos/core";

export class AgentDTO {
	private runtime: AgentRuntime;

	constructor(runtime: AgentRuntime) {
		this.runtime = runtime;
	}

	async stop() {
		return this.runtime.stop();
	}

	get id() {
		return this.runtime.agentId;
	}
}
