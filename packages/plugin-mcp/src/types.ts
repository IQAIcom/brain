export type McpPluginConfig =
	| {
			mode: "stdio";
			command: string;
			args: string[];
	  }
	| {
			mode: "sse";
			serverUrl: string;
			token?: string;
	  };
