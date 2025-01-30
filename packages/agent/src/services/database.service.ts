import type { IDatabaseAdapter, IDatabaseCacheAdapter } from "@elizaos/core";
import { SqliteDatabaseAdapter } from "@iqai/adapter-sqlite";
import Database from "better-sqlite3";
import * as path from "node:path";
import * as fs from "node:fs";

export class DatabaseService {
	private database: IDatabaseAdapter & IDatabaseCacheAdapter;

	constructor(customPath?: string) {
		const dataDir = customPath || path.join(process.cwd(), "./data");
		fs.mkdirSync(dataDir, { recursive: true });
		const dbPath = path.join(dataDir, "db.sqlite");

		this.database = new SqliteDatabaseAdapter(new Database(dbPath));
	}

	public init() {
		this.database.init();
		return this.database;
	}

	public close() {
		return this.database.close();
	}
}
