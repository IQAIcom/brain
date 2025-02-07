import type {
	Character,
	CacheStore,
	ModelProviderName,
	Plugin,
} from "@elizaos/core";

export interface AgentConfig {
	plugins?: Plugin[];
	modelProvider?: ModelProviderName;
	modelKey?: string;
	character?: Partial<Character>;
	cacheStore?: CacheStore;
}

export { Agent } from "./agent";
export { AgentBuilder } from "./builder";
