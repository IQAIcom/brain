import dedent from "dedent";

export class GetQuoteActionService {
	async getQuote() {
		try {
			// TODO: call odos api
			return []
		} catch (error) {
			throw new Error(`Failed to fetch lending stats: ${error.message}`);
		}
	}

	format(stats: Awaited<ReturnType<GetQuoteActionService["getQuote"]>>) {
		const formattedStats = stats
			.map((pool) => {
				const formattedSupply = Number(
					formatUnits(
						BigInt(pool.totalSupply as number),
						pool.decimals as number,
					),
				).toFixed(3);
				const formattedUtilization = (Number(pool.utilization) / 100).toFixed(
					2,
				);

				return dedent`
								🏦 ${pool.symbol} (${pool.assetSymbol})
								- APR: ${pool.apr}%
								- Utilization: ${formattedUtilization}%
								- Total Supply: ${formattedSupply} ${pool.assetSymbol}
						`;
			})
			.join("\n\n");

		return `📊 Current Quotes \n\n${formattedStats}`;
	}
}
