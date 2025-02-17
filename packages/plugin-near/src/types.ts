import type { Account } from "near-api-js";

export type HandlerContext = {
	account: Account;
};

export type NearEventListener = {
	eventName: string;
	contractId: string;
	handler: (input: any, context: HandlerContext) => Promise<any>;
	responseMethodName?: string;
	cronExpression?: string;
};

export type NearAgentConfig = {
	// Core NEAR connection config
	accountId: string;
	accountKey: string;

	// Array of event listeners
	listeners: NearEventListener[];

	// Optional configurations
	gasLimit?: string;
	networkConfig?: {
		networkId: string;
		nodeUrl: string;
	};

	indexerConfig?: {
		baseUrl: string;
		apiKey: string;
		blocksPerBatch: number;
		resetBlockIdOnStart: boolean;
	};
};

export type AgentEvent = {
	eventType: string;
	requestId: string;
	payload: any;
	sender: string;
	timestamp: number;
};
