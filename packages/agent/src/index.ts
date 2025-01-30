import { CacheService } from "./services/cache.service";
import { ClientService } from "./services/client.service";
import { DatabaseService } from "./services/database.service";
import { RuntimeService } from "./services/runtime.service";
import type { AgentConfig } from "./types";

export class Agent {
	private databaseService: DatabaseService;
	private cacheService: CacheService;
	private runtimeService: RuntimeService;
	private clientService: ClientService;

	constructor(private config: AgentConfig = {}) {
		this.databaseService = new DatabaseService(config.databasePath);
	}

	public async start() {
		try {
			const database = this.databaseService.init();
			this.cacheService = new CacheService(database, this.config.cacheStore);

			this.runtimeService = new RuntimeService(
				database,
				this.cacheService.getManager(),
				this.config,
			);
			const runtime = await this.runtimeService.init();

			if (this.config.clients) {
				this.clientService = new ClientService(runtime, this.config.clients);
				runtime.clients = await this.clientService.init();
			}
		} catch (error) {
			await this.stop();
			throw error;
		}
	}

	public async stop() {
		await this.databaseService?.close();
	}
}
