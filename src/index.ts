import { Database } from "bun:sqlite";

/**
 * Options for configuring the BunCache instance.
 * - `persistent`: when true, the cache is stored on disk in a SQLite file.
 * - `path`: custom file path for the SQLite DB (only used when `persistent` is true).
 */
interface BunCacheOptions {
  persistent?: boolean;
  path?: string;
}

/**
 * Row schema used internally for the SQLite table.
 */
interface CacheSchema {
  key: string;
  value: string | null;
  ttl: number | null;
}

/**
 * BunCache — a tiny cache backed by Bun's `bun:sqlite`.
 *
 * Key behaviors and notes:
 * - Values that are `string` or serializable `object` are stored as JSON text.
 * - `true` (boolean) and `null` are stored as SQL `NULL` in the underlying table.
 *   When a row's `value` is `NULL` it will be returned as `true` by `get()`.
 *   (This is an implementation detail — read the examples below to see how
 *   different inputs are returned.)
 * - `ttl` is stored as an absolute epoch ms timestamp. A `null` TTL means
 *   the value does not expire.
 *
 * Example:
 * const cache = new BunCache();
 * cache.put('a', 'hello');
 * cache.put('b', { x: 1 }, 1000); // expires in 1s
 * cache.put('c', true); // stored as NULL in DB and read back as true
 */
class BunCache {
  private cache: Database;
  constructor(options: BunCacheOptions = {}) {
    const { persistent = false, path } = options;

    if (persistent) {
      const dbPath = path ?? "cache.sqlite";
      this.cache = new Database(dbPath, { create: true });
    } else {
      this.cache = new Database(":memory:");
    }

    this.initializeSchema();
  }

  /**
   * Creates the cache table if it doesn't exist.
   */
  private initializeSchema() {
    this.cache.run(`
      CREATE TABLE IF NOT EXISTS cache (
        key TEXT PRIMARY KEY,
        value TEXT,
        ttl INTEGER
      );
    `);
  }

  /**
   * Retrieve a value from the cache.
   * - Returns `null` if the key is missing or expired.
   * - If the stored DB `value` is `NULL`, this method returns `true`.
   * - Strings and JSON-serializable objects are parsed back to their original types.
   */
  get(key: string): string | object | boolean | null {
    const query = this.cache.prepare("SELECT value, ttl FROM cache WHERE key = ?");
    const row = query.get(key) as CacheSchema | undefined;

    if (!row) return null;

    const now = Date.now();

    // Expired?
    if (row.ttl !== null && row.ttl <= now) {
      this.delete(key); // clean up
      return null;
    }

    if (row.value === null) {
      return null; // actual null
    }

    if (row.value === "__TRUE__") {
      return true;
    }

    try {
      return JSON.parse(row.value);
    } catch {
      return row.value; // fallback
    }
  }

  /**
   * Stores a value in the cache.
   *
   * @param key   Cache key
   * @param value Value to store (string, number, object, null, boolean)
   * @param ttl   Time-to-live in milliseconds (optional)
   */
  put(key: string, value: string | number | object | boolean | null, ttl?: number): boolean {
    let serialized: string | null;
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
      // We need to store both the value and a flag for true/null ambiguity
      // But we only have 3 columns. So: use a special sentinel string for true
      this.cache.run(
        "INSERT OR REPLACE INTO cache (key, value, ttl) VALUES (?, ?, ?)",
        [
          key,
          serialized ?? (isTrueFlag ? "__TRUE__" : null),
          expiration,
        ],
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Remove a key from the cache.
   */
  delete(key: string): boolean {
    try {
      this.cache.run("DELETE FROM cache WHERE key = ?", [key]);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check whether a key exists and hasn't expired.
   */
  hasKey(key: string): boolean {
    const query = this.cache.prepare(
      "SELECT ttl FROM cache WHERE key = ?",
    );
    const row = query.get(key) as { ttl: number | null } | undefined;

    if (!row) return false;

    if (row.ttl !== null && row.ttl <= Date.now()) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove all entries from the cache.
   */
  clear(): void {
    try {
      this.cache.run("DELETE FROM cache");
    } catch {
      // Intentionally ignore errors to match error-handling style of put/delete.
    }
  }

  /**
   * Close the underlying SQLite database connection.
   * Only necessary for persistent caches or explicit cleanup in tests.
   */
  close(): void {
    try {
      this.cache.close();
    } catch {
      // Swallow errors during close to avoid crashes in cleanup paths.
    }
  }
}

export default BunCache;
export type { BunCacheOptions, CacheSchema };