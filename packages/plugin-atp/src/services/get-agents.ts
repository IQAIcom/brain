import { API_URLS } from "../constants";
import dedent from "dedent";
import formatNumber from "../lib/format-number";
import type { Agent } from "../types";
import { elizaLogger } from "@elizaos/core";

export interface GetAgentsParams {
	sort?: "mcap" | "holders" | "inferences";
	limit?: number;
}

export class GetAgentsService {
	async getAgents(params: GetAgentsParams): Promise<Agent[]> {
		try {
			const url = new URL(API_URLS.AGENTS);
			if (params.sort) url.searchParams.append("sort", params.sort);
			if (params.limit)
				url.searchParams.append("limit", params.limit.toString());
			elizaLogger.info("🔍 Fetching agents", { url });

			const response = await fetch(url.toString(), {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch agent stats: ${response.statusText}`);
			}
			const data = await response.json();
			return data.agents as Agent[];
		} catch (error) {
			throw new Error(`Failed to fetch agent stats: ${error.message}`);
		}
	}

	formatAgents(agents: Agent[]) {
		if (agents.length === 0) {
			return "📊 No Agents found";
		}
		const formattedAgents = agents
			.map((agent) => {
				return dedent`
      🏷️ *${agent.name}* $(${agent.ticker})
      💰 Price: $${formatNumber(agent.currentPriceInUSD)} (${formatNumber(agent.currentPriceInIq)} IQ)
      👥 Holders: ${formatNumber(agent.holdersCount)}
      🔄 Inferences: ${formatNumber(agent.inferenceCount)}
      ⚡ Status: ${agent.isActive ? "Alive" : "Latent"}
      📝 Token: ${agent.tokenContract}
      🤖 Agent: ${agent.agentContract}
    `;
			})
			.join("\n\n");

		return `🤖 *Agents*\n\n${formattedAgents}`;
	}
}
