export type { AgentConfig, ClientConfig } from "./types";
import type { AgentConfig } from "./types";
import { setupDatabase } from "./services/database.service";
import { setupCacheSystem } from "./services/cache.service";
import { createAgentRuntime } from "./services/runtime.service";
import { setupClientInterfaces } from "./services/client.service";
import { AgentDTO } from "./dto/agent.dto";

export async function setupAgent(config: AgentConfig = {}) {
	let database = null;

	try {
		database = setupDatabase(config.databasePath);
		const cacheManager = setupCacheSystem(database, config.cacheStore);
		const runtime = await createAgentRuntime(database, cacheManager, config);

		await runtime.initialize();

		if (config.clients) {
			runtime.clients = await setupClientInterfaces(runtime, config.clients);
		}

		return new AgentDTO(runtime);
	} catch (error) {
		if (database) await database.close();
		throw error;
	}
}

export * from "./dto/agent.dto";
export * from "./services/database.service";
export * from "./services/cache.service";
export * from "./services/client.service";
export * from "./services/runtime.service";
