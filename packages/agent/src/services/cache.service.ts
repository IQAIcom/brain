import {
	CacheManager,
	CacheStore,
	DbCacheAdapter,
	FsCacheAdapter,
	type ICacheManager,
	type IDatabaseCacheAdapter,
	stringToUuid,
} from "@elizaos/core";
import path from "node:path";

export class CacheService {
	private cacheManager: ICacheManager;

	constructor(
		database: IDatabaseCacheAdapter,
		cacheStore: CacheStore = CacheStore.DATABASE,
	) {
		const cacheId = stringToUuid("default");

		switch (cacheStore) {
			case CacheStore.DATABASE:
				this.cacheManager = new CacheManager(
					new DbCacheAdapter(database, cacheId),
				);
				break;
			case CacheStore.FILESYSTEM: {
				const cacheDir = path.resolve(process.cwd(), "cache");
				this.cacheManager = new CacheManager(new FsCacheAdapter(cacheDir));
				break;
			}
			default:
				throw new Error(`Unsupported cache store: ${cacheStore}`);
		}
	}

	public getManager() {
		return this.cacheManager;
	}
}
