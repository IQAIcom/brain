export interface ATPActionParams {
	walletPrivateKey?: string;
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
