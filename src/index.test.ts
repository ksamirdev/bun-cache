import { describe, beforeEach, setSystemTime, it, expect } from "bun:test";

import BunCache from "./index";

describe("BunCache", () => {
  let cache: BunCache;

  beforeEach(() => {
    cache = new BunCache();
  });

  it("should store and retrieve a string value", () => {
    const key = "test-key";
    const value = "test-value";
    const ttl = 1000;

    expect(cache.put(key, value, ttl)).toBe(true);
    expect(cache.get(key)).toBe(value);
  });

  it("should store and retrieve an object value", () => {
    const key = "test-key";
    const value = { foo: "bar" };
    const ttl = 1000;

    expect(cache.put(key, value, ttl)).toBe(true);
    expect(cache.get(key)).toEqual(value);
  });

  it("should return null for a non-existent key", () => {
    const key = "non-existent-key";

    expect(cache.get(key)).toBeNull();
  });

  it("should return null for an expired key", () => {
    const key = "test-key";
    const value = "test-value";
    const ttl = 100;

    expect(cache.put(key, value, ttl)).toBe(true);
    setSystemTime(new Date(Date.now() + ttl));
    expect(cache.get(key)).toBeNull();
  });
});
