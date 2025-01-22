import type {
	ModelProviderName,
	CacheStore,
	Character,
	Plugin,
} from "@elizaos/core";

export interface ClientConfig {
	direct?: {
		enabled: boolean;
		port?: number;
	};
	telegram?: {
		token?: string;
	};
	twitter?: {
		username?: string;
		password?: string;
	};
}

export interface AgentConfig {
	plugins?: Plugin[];
	modelProvider?: ModelProviderName;
	modelKey?: string;
	character?: Partial<Character>;
	cacheStore?: CacheStore;
	databasePath?: string;
	clients?: ClientConfig;
}
