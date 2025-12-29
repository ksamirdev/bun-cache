import {
  describe,
  beforeEach,
  it,
  expect,
  afterAll,
  afterEach,
  setSystemTime,
} from "bun:test";
import { unlinkSync, existsSync } from "node:fs";
import { join } from "node:path";

import BunCache from ".";

const TEST_DB_PATH = join(import.meta.dirname, "test-cache.sqlite");
const CUSTOM_DB_PATH = join(import.meta.dirname, "custom-cache.db");

// Helper to clean up test files
const cleanupFiles = () => {
  [TEST_DB_PATH, CUSTOM_DB_PATH, "cache.sqlite"].forEach((path) => {
    if (existsSync(path)) {
      unlinkSync(path);
    }
  });
};

afterAll(cleanupFiles);

describe("BunCache (in-memory)", () => {
  let cache: BunCache;

  beforeEach(() => {
    cache = new BunCache(); // default: non-persistent
  });

  afterEach(() => {
    cache.clear();
  });

  it("should store and retrieve a string value", () => {
    expect(cache.put("key", "hello")).toBe(true);
    expect(cache.get("key")).toBe("hello");
  });

  it("should store and retrieve an object", () => {
    const obj = { name: "test", value: 42 };
    expect(cache.put("obj", obj)).toBe(true);
    expect(cache.get("obj")).toEqual(obj);
  });

  it("should store null as distinguishable from absence", () => {
    expect(cache.put("nullkey", null)).toBe(true);
    expect(cache.get("nullkey")).toBe(null);
  });

  it("should store boolean true specially and retrieve it", () => {
    expect(cache.put("truekey", true)).toBe(true);
    expect(cache.get("truekey")).toBe(true);
  });

  it("should return null for non-existent key", () => {
    expect(cache.get("missing")).toBeNull();
  });

  it("should respect TTL and expire entries", () => {
    cache.put("short", "data", 50);
    expect(cache.get("short")).toBe("data");
    expect(cache.hasKey("short")).toBe(true);

    // Advance time
    const mockDate = new Date(Date.now() + 100);
    setSystemTime(mockDate);

    expect(cache.get("short")).toBeNull();
    expect(cache.hasKey("short")).toBe(false); // now respects expiration!
  });

  it("should keep entries without TTL forever", () => {
    cache.put("forever", "persistent");
    setSystemTime(new Date(Date.now() + 1_000_000));
    expect(cache.get("forever")).toBe("persistent");
    expect(cache.hasKey("forever")).toBe(true);
  });

  it("hasKey should return false for expired keys", () => {
    cache.put("expiring", "temp", 10);
    expect(cache.hasKey("expiring")).toBe(true);

    setSystemTime(new Date(Date.now() + 100));
    expect(cache.hasKey("expiring")).toBe(false);
  });

  it("should delete keys correctly", () => {
    cache.put("todelete", "value");
    expect(cache.delete("todelete")).toBe(true);
    expect(cache.get("todelete")).toBeNull();
    expect(cache.hasKey("todelete")).toBe(false);
  });
});

describe("BunCache (persistent - default path)", () => {
  let cache: BunCache;

  beforeEach(() => {
    cleanupFiles(); // ensure clean start
    cache = new BunCache({ persistent: true });
  });

  afterEach(() => {
    cache.close();
  });

  it("should persist data across instances", () => {
    cache.put("shared", { data: "important" }, 5000);
    cache.close();

    // New instance using same default path
    const cache2 = new BunCache({ persistent: true });
    expect(cache2.get("shared")).toEqual({ data: "important" });
    cache2.close();
  });
});

describe("BunCache (persistent - custom path)", () => {
  let cache: BunCache;

  beforeEach(() => {
    cleanupFiles();
    cache = new BunCache({ persistent: true, path: CUSTOM_DB_PATH });
  });

  afterEach(() => {
    cache.close();
  });

  it("should create and load from custom path", () => {
    expect(existsSync(CUSTOM_DB_PATH)).toBe(true);

    cache.put("custom", "works");
    cache.close();

    const cache2 = new BunCache({ persistent: true, path: CUSTOM_DB_PATH });
    expect(cache2.get("custom")).toBe("works");
    cache2.close();
  });

  it("different paths should be isolated", () => {
    cache.put("only-in-custom", "secret");
    cache.close();

    // This uses default path (cache.sqlite), not custom
    const defaultCache = new BunCache({ persistent: true });
    expect(defaultCache.get("only-in-custom")).toBeNull();
    defaultCache.close();
  });
});

describe("BunCache utility methods", () => {
  it("clear() should remove all entries", () => {
    const cache = new BunCache();
    cache.put("a", 1);
    cache.put("b", 2);
    expect(cache.hasKey("a")).toBe(true);

    cache.clear();

    expect(cache.hasKey("a")).toBe(false);
    expect(cache.hasKey("b")).toBe(false);
  });

  it("close() should be safe to call on in-memory cache", () => {
    const cache = new BunCache();
    expect(() => cache.close()).not.toThrow();
  });
});