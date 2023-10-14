// @bun
// src/index.ts
import {Database} from "bun:sqlite";

class BunCache {
  cache;
  constructor() {
    this.cache = new Database(":memory:");
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
    const query = this.cache.query("SELECT value, ttl FROM cache WHERE key = ?");
    const result = query.get(key);
    if (result !== null) {
      const currentTime = Date.now();
      if (result.ttl > currentTime) {
        if (result.value === null)
          return null;
        try {
          return JSON.parse(result.value);
        } catch (error) {
          return result.value;
        }
      }
      this.delete(key);
    }
    return null;
  }
  put(key, value, ttl) {
    const expirationTime = Date.now() + ttl;
    try {
      this.cache.run("INSERT OR REPLACE INTO cache VALUES (?, ?, ?)", [
        key,
        value !== null ? typeof value === "string" ? value : JSON.stringify(value) : null,
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
}
var src_default = BunCache;
export {
  src_default as default
};
