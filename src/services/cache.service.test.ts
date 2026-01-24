import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ChromeStorageAPI } from "../infrastructure/chrome/types";
import { createMemoryCache, createPersistentCache, createTieredCache } from "./cache.service";

describe("createMemoryCache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("returns null for non-existent key", async () => {
    const cache = createMemoryCache<string>();
    const result = await cache.get("missing");
    expect(result).toBeNull();
  });

  it("stores and retrieves data", async () => {
    const cache = createMemoryCache<string>();
    await cache.set("key", "value", 1000);
    const result = await cache.get("key");
    expect(result).toBe("value");
  });

  it("returns null for expired data", async () => {
    const cache = createMemoryCache<string>();
    await cache.set("key", "value", 1000);

    vi.advanceTimersByTime(1001);

    const result = await cache.get("key");
    expect(result).toBeNull();
  });

  it("deletes data", async () => {
    const cache = createMemoryCache<string>();
    await cache.set("key", "value", 1000);
    await cache.delete("key");
    const result = await cache.get("key");
    expect(result).toBeNull();
  });

  it("handles complex objects", async () => {
    interface TestData {
      id: string;
      items: number[];
    }
    const cache = createMemoryCache<TestData>();
    const data = { id: "test", items: [1, 2, 3] };
    await cache.set("key", data, 1000);
    const result = await cache.get("key");
    expect(result).toEqual(data);
  });
});

describe("createPersistentCache", () => {
  function createMockStorage() {
    const store: Record<string, unknown> = {};
    return {
      get: vi.fn(async (key: string) => store[key] ?? null),
      set: vi.fn(async (key: string, value: unknown) => {
        store[key] = value;
      }),
      remove: vi.fn(async (key: string) => {
        delete store[key];
      }),
    } as unknown as ChromeStorageAPI & {
      get: ReturnType<typeof vi.fn>;
      set: ReturnType<typeof vi.fn>;
    };
  }

  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("returns null for non-existent key", async () => {
    const storage = createMockStorage();
    const cache = createPersistentCache<string>({ storage }, "testCache");
    const result = await cache.get("missing");
    expect(result).toBeNull();
  });

  it("stores and retrieves data", async () => {
    const storage = createMockStorage();
    const cache = createPersistentCache<string>({ storage }, "testCache");
    await cache.set("key", "value", 1000);
    const result = await cache.get("key");
    expect(result).toBe("value");
  });

  it("returns null for expired data and cleans up", async () => {
    const storage = createMockStorage();
    const cache = createPersistentCache<string>({ storage }, "testCache");
    await cache.set("key", "value", 1000);

    vi.advanceTimersByTime(1001);

    const result = await cache.get("key");
    expect(result).toBeNull();
    // Should have saved to clean up expired entry
    expect(storage.set).toHaveBeenCalledTimes(2);
  });

  it("deletes data", async () => {
    const storage = createMockStorage();
    const cache = createPersistentCache<string>({ storage }, "testCache");
    await cache.set("key", "value", 1000);
    await cache.delete("key");
    const result = await cache.get("key");
    expect(result).toBeNull();
  });
});

describe("createTieredCache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("returns data from memory cache first", async () => {
    const memory = createMemoryCache<string>();
    const persistent = createMemoryCache<string>();

    const tiered = createTieredCache(memory, persistent);

    await memory.set("key", "memory-value", 1000);
    await persistent.set("key", "persistent-value", 1000);

    const result = await tiered.get("key");
    expect(result).toBe("memory-value");
  });

  it("falls back to persistent cache when memory is empty", async () => {
    const memory = createMemoryCache<string>();
    const persistent = createMemoryCache<string>();

    const tiered = createTieredCache(memory, persistent);

    await persistent.set("key", "persistent-value", 1000);

    const result = await tiered.get("key");
    expect(result).toBe("persistent-value");
  });

  it("hydrates memory cache from persistent cache", async () => {
    const memory = createMemoryCache<string>();
    const persistent = createMemoryCache<string>();

    const tiered = createTieredCache(memory, persistent);

    await persistent.set("key", "persistent-value", 1000);

    // First get hydrates memory
    await tiered.get("key");

    // Verify memory is now populated
    const memoryResult = await memory.get("key");
    expect(memoryResult).toBe("persistent-value");
  });

  it("writes to both caches", async () => {
    const memory = createMemoryCache<string>();
    const persistent = createMemoryCache<string>();

    const tiered = createTieredCache(memory, persistent);

    await tiered.set("key", "value", 1000);

    const memoryResult = await memory.get("key");
    const persistentResult = await persistent.get("key");

    expect(memoryResult).toBe("value");
    expect(persistentResult).toBe("value");
  });

  it("deletes from both caches", async () => {
    const memory = createMemoryCache<string>();
    const persistent = createMemoryCache<string>();

    const tiered = createTieredCache(memory, persistent);

    await tiered.set("key", "value", 1000);
    await tiered.delete("key");

    const memoryResult = await memory.get("key");
    const persistentResult = await persistent.get("key");

    expect(memoryResult).toBeNull();
    expect(persistentResult).toBeNull();
  });

  it("returns null when both caches are empty", async () => {
    const memory = createMemoryCache<string>();
    const persistent = createMemoryCache<string>();

    const tiered = createTieredCache(memory, persistent);

    const result = await tiered.get("missing");
    expect(result).toBeNull();
  });
});
