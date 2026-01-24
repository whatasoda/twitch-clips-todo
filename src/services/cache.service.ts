import type { ChromeStorageAPI } from "../infrastructure/chrome/types";

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export interface CacheService<T> {
  get(key: string): Promise<T | null>;
  set(key: string, data: T, ttlMs: number): Promise<void>;
  delete(key: string): Promise<void>;
}

/**
 * Create an in-memory cache service.
 * Fast but cleared on service worker restart.
 */
export function createMemoryCache<T>(): CacheService<T> {
  const cache = new Map<string, CacheEntry<T>>();

  return {
    async get(key) {
      const entry = cache.get(key);
      if (entry && entry.expiresAt > Date.now()) {
        return entry.data;
      }
      cache.delete(key);
      return null;
    },

    async set(key, data, ttlMs) {
      cache.set(key, { data, expiresAt: Date.now() + ttlMs });
    },

    async delete(key) {
      cache.delete(key);
    },
  };
}

export interface PersistentCacheDeps {
  storage: ChromeStorageAPI;
}

/**
 * Create a persistent cache service backed by Chrome storage.
 * Slower but survives service worker restarts.
 */
export function createPersistentCache<T>(
  deps: PersistentCacheDeps,
  storageKey: string,
): CacheService<T> {
  const { storage } = deps;

  type CacheStore = Record<string, CacheEntry<T>>;

  async function getStore(): Promise<CacheStore> {
    return (await storage.get<CacheStore>(storageKey)) ?? {};
  }

  async function saveStore(store: CacheStore): Promise<void> {
    await storage.set(storageKey, store);
  }

  return {
    async get(key) {
      const store = await getStore();
      const entry = store[key];
      if (entry && entry.expiresAt > Date.now()) {
        return entry.data;
      }
      // Clean up expired entry
      if (entry) {
        delete store[key];
        await saveStore(store);
      }
      return null;
    },

    async set(key, data, ttlMs) {
      const store = await getStore();
      store[key] = { data, expiresAt: Date.now() + ttlMs };
      await saveStore(store);
    },

    async delete(key) {
      const store = await getStore();
      delete store[key];
      await saveStore(store);
    },
  };
}

/**
 * Create a tiered cache that checks memory first, then persistent storage.
 * Writes go to both caches.
 */
export function createTieredCache<T>(
  memory: CacheService<T>,
  persistent: CacheService<T>,
): CacheService<T> {
  return {
    async get(key) {
      // Try memory first (fast)
      const memResult = await memory.get(key);
      if (memResult !== null) {
        return memResult;
      }

      // Fall back to persistent (slower but survives restart)
      const persistResult = await persistent.get(key);
      if (persistResult !== null) {
        // Hydrate memory cache
        // Use a reasonable TTL since we don't know the original
        await memory.set(key, persistResult, 60000);
        return persistResult;
      }

      return null;
    },

    async set(key, data, ttlMs) {
      // Write to both caches
      await Promise.all([memory.set(key, data, ttlMs), persistent.set(key, data, ttlMs)]);
    },

    async delete(key) {
      await Promise.all([memory.delete(key), persistent.delete(key)]);
    },
  };
}
