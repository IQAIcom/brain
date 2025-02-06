import dedent from "dedent";
import { formatUnits } from "viem";

export class AgentsStatsService {
	async getStats() {
		try {
			// TODO: get right endpoint
			const data = await []
			return data.pairs.map((pair) => ({
				symbol: pair.symbol,
				assetSymbol: pair.asset.symbol,
				utilization: pair.dailyHistory[0].utilization,
				totalSupply: pair.dailyHistory[0].totalAssetAmount,
				decimals: pair.asset.decimals,
			}));
		} catch (error) {
			throw new Error(`Failed to fetch stats: ${error.message}`);
		}
	}

	formatStats(stats: Awaited<ReturnType<AgentsStatsService["getStats"]>>) {
		if (stats.length === 0) {
			return dedent`
				📊 IQ ATP Statistics

				No active agents found.
			`;
		}

		// TODO: refactor
		const formattedStats = stats
			.map((agent) => {
				const formattedSupply = Number(
					formatUnits(
						BigInt(agent.totalSupply as number),
						pool.decimals as number,
					),
				).toFixed(3);
				const formattedUtilization = (Number(agent.utilization) / 100).toFixed(
					2,
				);

				return dedent`
					🏦 ${agent.symbol} (${agent.assetSymbol})
					├ 📈 APR: ${agent.apr}%
					├ 📊 Utilization: ${formattedUtilization}%
					└ 💰 Total Supply: ${formattedSupply} ${agent.assetSymbol}
				`;
			})
			.join("\n\n");

		return dedent`
			📊 IQ ATP Statistics
			═══════════════════════════

			${formattedStats}

			Last Updated: ${new Date().toLocaleString()}
		`;
	}
}
