/**
 * A class representing a cache using Bun's SQLite.
 */
declare class BunCache {
    private cache;
    /**
     * Creates a new instance of the BunCache class.
     */
    constructor(persistance?: boolean);
    /**
     * Initializes the cache schema.
     */
    private initializeSchema;
    /**
     * Retrieves the value associated with a key from the cache.
     * @param key - The key for which to fetch the value.
     * @returns The value if the key exists and hasn't expired, `null` otherwise.
     */
    get(key: string): string | object | boolean | null;
    /**
     * Adds a value to the cache.
     * @param key - The key under which to store the value.
     * @param value - The value to be stored.
     * @param ttl - The time-to-live for the value, in milliseconds.
     * @returns `true` if the value was successfully stored, `false` otherwise.
     */
    put(key: string, value: string | object | null, ttl?: number): boolean;
    /**
     * Removes a key from the cache.
     * @param key - The key to be deleted.
     * @returns `true` if the key was successfully deleted, `false` otherwise.
     */
    delete(key: string): boolean;
    /**
     * Checks if a key exists in the cache.
     * @param key - The key to be checked
     * @returns `true` if the key exists, `false` otherwise
     */
    hasKey(key: string): boolean;
}
export default BunCache;
export interface CacheSchema {
    key: string;
    value: string | null;
    ttl: number | null;
}
