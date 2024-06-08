// @bun
// src/index.ts
import {Database} from "bun:sqlite";

class BunCache {
  cache;
  constructor(persistance = false) {
    this.cache = new Database(persistance ? "cache.sqlite" : ":memory:");
    this.initializeSchema();
  }
  initializeSchema() {
    this.cache.run(`
      CREATE TABLE IF NOT EXISTS cache (
        key TEXT PRIMARY KEY,
        value TEXT,
        ttl INTEGER,
        UNIQUE(key)
      );
    `);
  }
  get(key) {
    const query = this.cache.prepare("SELECT value, ttl FROM cache WHERE key = ?");
    const result = query.get(key);
    if (!result)
      return null;
    if (result.value === null)
      return true;
    const currentTime = Date.now();
    if (result.ttl === null || result.ttl > currentTime) {
      try {
        return JSON.parse(result.value);
      } catch (error) {
        return result.value;
      }
    }
    this.delete(key);
    return null;
  }
  put(key, value, ttl) {
    const expirationTime = typeof ttl === "undefined" ? null : Date.now() + ttl;
    try {
      this.cache.run("INSERT OR REPLACE INTO cache VALUES (?, ?, ?)", [
        key,
        value ? JSON.stringify(value) : null,
        expirationTime
      ]);
      return true;
    } catch (error) {
      return false;
    }
  }
  delete(key) {
    try {
      this.cache.run("DELETE FROM cache WHERE key = ?", [key]);
      return true;
    } catch (error) {
      return false;
    }
  }
  hasKey(key) {
    try {
      const query = this.cache.prepare("SELECT * FROM cache WHERE key = ?");
      return query.get(key) !== null;
    } catch (error) {
      return false;
    }
  }
}
var src_default = BunCache;
export {
  src_default as default
};
