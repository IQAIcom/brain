import * as fs from "node:fs";
import * as path from "node:path";
import { SqliteDatabaseAdapter as ElizaSqliteDatabaseAdapter } from "@elizaos/adapter-sqlite";
import Database from "better-sqlite3";

interface SqliteDatabaseAdapterOptions {
	dbPath?: string;
}

export class SqliteDatabaseAdapter extends ElizaSqliteDatabaseAdapter {
	constructor(options: SqliteDatabaseAdapterOptions = {}) {
		const dataDir = path.join(
			process.cwd(),
			options.dbPath ? path.dirname(options.dbPath) : "./data",
		);
		fs.mkdirSync(dataDir, { recursive: true });
		const dbPath = options.dbPath
			? path.join(process.cwd(), options.dbPath)
			: path.join(dataDir, "db.sqlite");
		super(new Database(dbPath));
	}
}
