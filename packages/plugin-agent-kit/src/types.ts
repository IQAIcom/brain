import type { CdpAgentkit } from "@coinbase/cdp-agentkit-core";
import type {HandlerCallback, IAgentRuntime, Memory, State } from "@elizaos/core";
import type { Tool } from "@coinbase/cdp-langchain";

export interface AgentKitActionParams {
    getClient: () => Promise<CdpAgentkit>;
    config?: {
        networkId?: string;
    };
}

export interface ActionResult {
    response: string;
    content: unknown;
}

export interface ActionHandler {
    (
        runtime: IAgentRuntime,
        message: Memory,
        state: State | undefined,
        options?: Record<string, unknown>,
        callback?: HandlerCallback
    ): Promise<boolean>;
}


export interface AgentKitConfig {
    networkId?: string;
    cdpApiKeyName?: string;
    cdpApiKeyPrivateKey?: string;
    walletDataPath?: string;
}
