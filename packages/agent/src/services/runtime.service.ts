import {
	AgentRuntime,
	type ICacheManager,
	type IDatabaseAdapter,
	ModelProviderName,
	defaultCharacter,
} from "@elizaos/core";
import type { AgentConfig } from "../types";

export class RuntimeService {
	private runtime: AgentRuntime;

	constructor(
		private database: IDatabaseAdapter,
		private cache: ICacheManager,
		private config: AgentConfig = {},
	) {}

	public async init() {
		const plugins = [...(this.config.plugins || [])];

		this.runtime = new AgentRuntime({
			databaseAdapter: this.database,
			token: this.config.modelKey,
			modelProvider: this.config.modelProvider || ModelProviderName.OPENAI,
			plugins,
			character: {
				...defaultCharacter,
				...this.config.character,
			},
			cacheManager: this.cache,
			fetch: async (url: string, options: RequestInit) => {
				return fetch(url, options);
			},
			evaluators: [],
			providers: [],
			actions: [],
			services: [],
			managers: [],
		});

		await this.runtime.initialize();
		return this.runtime;
	}
}
