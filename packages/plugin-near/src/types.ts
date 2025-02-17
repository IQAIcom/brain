import type { Account } from "near-api-js";

export type HandlerContext = {
	account: Account;
};

export type NearAgentConfig = {
	// Core NEAR connection config
	accountId: string;
	accountKey: string;
	contractId: string;

	// Agent identity and permissions
	agentId: string;
	allowedContracts?: string[];

	// Agent behavior definition
	eventHandlers: {
		[eventName: string]: {
			handler: (input: any, context: HandlerContext) => Promise<any>;
			inputSchema?: Record<string, any>;
			outputSchema?: Record<string, any>;
		};
	};

	// Optional configurations
	gasLimit?: string;
	networkConfig?: {
		networkId: string;
		nodeUrl: string;
	};
};

export type AgentEvent = {
	eventType: string;
	requestId: string;
	payload: any;
	sender: string;
	timestamp: number;
};

export type AgentResponse = {
	requestId: string;
	result: any;
	error?: string;
};
