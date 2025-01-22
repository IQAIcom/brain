import {
  CacheManager,
  CacheStore,
  DbCacheAdapter,
  FsCacheAdapter,
  ICacheManager,
  IDatabaseCacheAdapter,
  stringToUuid,
} from "@elizaos/core";
import * as path from "node:path";

export function setupCacheSystem(
  database: IDatabaseCacheAdapter,
  cacheStore: CacheStore = CacheStore.DATABASE
): ICacheManager {
  const cacheId = stringToUuid("default");

  switch (cacheStore) {
    case CacheStore.DATABASE:
      return new CacheManager(new DbCacheAdapter(database, cacheId));
    case CacheStore.FILESYSTEM: {
      const cacheDir = path.resolve(process.cwd(), "cache");
      return new CacheManager(new FsCacheAdapter(cacheDir));
    }
    default:
      throw new Error(`Unsupported cache store: ${cacheStore}`);
  }
}
