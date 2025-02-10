import { API_URLS } from "../constants";
import dedent from "dedent";
import formatNumber from "../lib/format-number";
import type { AgentStats } from "../types";

export class AgentsStatsService {
  async getStats(agentAddress: string): Promise<AgentStats> {
    try {
      const url = new URL(API_URLS.AGENTS_STATS);
      url.searchParams.append('address', agentAddress);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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
