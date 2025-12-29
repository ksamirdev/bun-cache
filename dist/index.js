// @bun
// src/index.ts
import { Database } from "bun:sqlite";

class BunCache {
  cache;
  constructor(options = {}) {
    const { persistent = false, path } = options;
    if (persistent) {
      const dbPath = path ?? "cache.sqlite";
      this.cache = new Database(dbPath, { create: true });
    } else {
      this.cache = new Database(":memory:");
    }
    this.initializeSchema();
  }
  initializeSchema() {
    this.cache.run(`
      CREATE TABLE IF NOT EXISTS cache (
        key TEXT PRIMARY KEY,
        value TEXT,
        ttl INTEGER
      );
    `);
  }
  get(key) {
    const query = this.cache.prepare("SELECT value, ttl FROM cache WHERE key = ?");
    const row = query.get(key);
    if (!row)
      return null;
    const now = Date.now();
    if (row.ttl !== null && row.ttl <= now) {
      this.delete(key);
      return null;
    }
    if (row.value === null) {
      return null;
    }
    if (row.value === "__TRUE__") {
      return true;
    }
    try {
      return JSON.parse(row.value);
    } catch {
      return row.value;
    }
  }
  put(key, value, ttl) {
    let serialized;
    let isTrueFlag = false;
    if (value === true) {
      serialized = null;
      isTrueFlag = true;
    } else if (value === null) {
      serialized = null;
      isTrueFlag = false;
    } else {
      serialized = JSON.stringify(value);
    }
    const expiration = ttl !== undefined ? Date.now() + ttl : null;
    try {
      this.cache.run("INSERT OR REPLACE INTO cache (key, value, ttl) VALUES (?, ?, ?)", [key, serialized ?? (isTrueFlag ? "__TRUE__" : null), expiration]);
      return true;
    } catch {
      return false;
    }
  }
  delete(key) {
    try {
      this.cache.run("DELETE FROM cache WHERE key = ?", [key]);
      return true;
    } catch {
      return false;
    }
  }
  hasKey(key) {
    const query = this.cache.prepare("SELECT ttl FROM cache WHERE key = ?");
    const row = query.get(key);
    if (!row)
      return false;
    if (row.ttl !== null && row.ttl <= Date.now()) {
      this.delete(key);
      return false;
    }
    return true;
  }
  clear() {
    try {
      this.cache.run("DELETE FROM cache");
    } catch {}
  }
  close() {
    try {
      this.cache.close();
    } catch {}
  }
}
export {
  BunCache
};
