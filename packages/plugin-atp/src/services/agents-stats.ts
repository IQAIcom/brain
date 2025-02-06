export class AgentsStatsService {
	async getStats() {
		throw new Error("Not implemented")
	}

	formatStats(_stats: Awaited<ReturnType<AgentsStatsService["getStats"]>>) {
		throw new Error("Not implemented")
	}
}
