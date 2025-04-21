import { elizaLogger } from "@elizaos/core";
import dedent from "dedent";
import { API_URLS, DEV_API_URLS } from "../constants";
import formatNumber from "../lib/format-number";
import type { AgentStats } from "../types";

export class AgentStatsService {
	async getStats(agentAddress: string): Promise<AgentStats> {
		try {
			const url = new URL(
				process.env.ATP_USE_DEV
					? DEV_API_URLS.AGENTS_STATS
					: API_URLS.AGENTS_STATS,
			);
			url.searchParams.append("address", agentAddress);
			elizaLogger.info("🔍 Fetching agent stats", { url });

			const response = await fetch(url.toString(), {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch agent stats: ${response.statusText}`);
			}
			return (await response.json()) as AgentStats;
		} catch (error) {
			throw new Error(`Failed to fetch agent stats: ${error.message}`);
		}
	}

	formatStats(stats: AgentStats): string {
		return dedent`
      📊 *Agent Statistics*

      💰 Price: ${formatNumber(stats.currentPriceInUSD)} USD (${formatNumber(stats.currentPriceInIq)} IQ)
      📈 Market Cap: ${formatNumber(stats.marketCap)} USD
      📊 24h Change: ${formatNumber(stats.changeIn24h)}%
      👥 Holders: ${stats.holdersCount}
      🤖 Inferences: ${stats.inferenceCount}
      🏷️ Category: ${stats.category}
    `;
	}
}
