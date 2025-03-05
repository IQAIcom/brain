export interface WalletActionParams {
	covalentApiKey: string | undefined;
}

export interface TokenHolding {
	contractAddress: string;
	contractName: string;
	contractTickerSymbol: string;
	contractDecimals: number;
	balance: string;
	quoteRate: number;
	quote: number;
	type: string;
	logoUrl?: string;
}

export interface WalletHoldings {
	address: string;
	chainId: string;
	chainName: string;
	items: TokenHolding[];
	quoteCurrency: string;
	totalQuote: number;
}
