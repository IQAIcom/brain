import type { IDatabaseAdapter, IDatabaseCacheAdapter } from "@elizaos/core";
import { SqliteDatabaseAdapter } from "@iqai/adapter-sqlite";
import Database from "better-sqlite3";
import * as path from "node:path";
import * as fs from "node:fs";

export function setupDatabase(
	customPath?: string,
): IDatabaseAdapter & IDatabaseCacheAdapter {
	const dataDir = customPath || path.join(process.cwd(), "./data");
	fs.mkdirSync(dataDir, { recursive: true });
	const dbPath = path.join(dataDir, "db.sqlite");

	const database = new SqliteDatabaseAdapter(new Database(dbPath));
	database.init();

	return database;
}
