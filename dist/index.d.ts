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
declare class BunCache {
    private cache;
    constructor(options?: BunCacheOptions);
    /**
     * Creates the cache table if it doesn't exist.
     */
    private initializeSchema;
    /**
     * Retrieve a value from the cache.
     * - Returns `null` if the key is missing or expired.
     * - If the stored DB `value` is `NULL`, this method returns `true`.
     * - Strings and JSON-serializable objects are parsed back to their original types.
     */
    get(key: string): string | object | boolean | null;
    /**
     * Stores a value in the cache.
     *
     * @param key   Cache key
     * @param value Value to store (string, number, object, null, boolean)
     * @param ttl   Time-to-live in milliseconds (optional)
     */
    put(key: string, value: string | number | object | boolean | null, ttl?: number): boolean;
    /**
     * Remove a key from the cache.
     */
    delete(key: string): boolean;
    /**
     * Check whether a key exists and hasn't expired.
     */
    hasKey(key: string): boolean;
    /**
     * Remove all entries from the cache.
     */
    clear(): void;
    /**
     * Close the underlying SQLite database connection.
     * Only necessary for persistent caches or explicit cleanup in tests.
     */
    close(): void;
}
export default BunCache;
export type { BunCacheOptions, CacheSchema };
