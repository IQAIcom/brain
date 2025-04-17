export interface ATPActionParams {
	walletPrivateKey?: string;
	apiKey?: string;
}

export interface AgentHolding {
	tokenContract: string;
	tokenAmount: string;
	name: string;
	currentPriceInUsd: number;
}

export interface AgentPositionsResponse {
	count: number;
	holdings: AgentHolding[];
}

export interface AgentStats {
	currentPriceInIq: number;
	currentPriceInUSD: number;
	marketCap: number;
	changeIn24h: number;
	holdersCount: number;
	inferenceCount: number;
	category: string;
}

export interface Agent {
	tokenContract: string;
	agentContract: string;
	isActive: boolean;
	currentPriceInIq: number;
	holdersCount: number;
	inferenceCount: number;
	name: string;
	ticker: string;
	currentPriceInUSD: number;
}
