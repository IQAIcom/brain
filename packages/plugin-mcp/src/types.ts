export type McpPluginConfig = {
	name: string;
	description: string;
	transport: McpTransportType;
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
