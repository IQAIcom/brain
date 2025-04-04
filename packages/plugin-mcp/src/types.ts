import type { IAgentRuntime, Memory, State } from "@elizaos/core";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export type McpPluginConfig = {
	name: string;
	description: string;
	transport: McpTransportType;
	handleResponse?: (
		result: CallToolResult,
		runtime: IAgentRuntime,
		state: State,
		memory: Memory,
	) => Promise<string>;
	disableToolChaining?: boolean;
	toolChainingTemplate?: string;
};

export type McpTransportType =
	| {
			mode: "stdio";
			command: string;
			args: string[];
	  }
	| {
			mode: "sse";
			serverUrl: string;
			headers?: HeadersInit;
	  };
