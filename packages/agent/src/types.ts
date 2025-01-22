import { ModelProviderName, CacheStore } from "@elizaos/core";

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
  plugins?: any[];
  modelProvider?: ModelProviderName;
  character?: {
    bio?: string;
    messageExamples?: string[];
    lore?: string[];
    style?: {
      all?: string[];
      chat?: string[];
      post?: string[];
    };
  };
  cacheStore?: CacheStore;
  databasePath?: string;
  openAiKey?: string;
  cdpConfig?: {
    networkId?: string;
    apiKeyName?: string;
    apiKeyPrivateKey?: string;
  };
  clients?: ClientConfig;
}
