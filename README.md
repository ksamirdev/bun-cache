# <img src="https://user-images.githubusercontent.com/709451/182802334-d9c42afe-f35d-4a7b-86ea-9985f73f20c3.png" alt="Logo" height=30 align="center"> Bun Cache

Bun Cache is a caching library for Bun apps that harnesses the power of the Bun's SQLite to offer a straightforward and efficient caching solution.

## Installation 📦

To get Bun Cache up and running, you can easily install it using bun cli:

```bash
bun add bun-cache
```

## Usage 🚀

To leverage Bun Cache, simply create a new instance of the `BunCache` class and start using its methods:

```typescript
import { BunCache } from "bun-cache";

const cache = new BunCache();

cache.put("my-key", "my-value", 1000);
const value = cache.get("my-key");

console.log(value); // 🌟 "my-value"
```

## API 🧰

### `BunCache` Class

#### `put(key: string, value: string | object, ttl: number): boolean`

Adds a value to the cache.

- `key`: The key under which to store the value.
- `value`: The value to be stored.
- `ttl`: The time-to-live for the value, in milliseconds.
- Returns: `true` if the value was successfully stored, `false` otherwise.

#### `get(key: string): string | object | null`

Retrieves the value associated with a key from the cache.

- `key`: The key for which to fetch the value.
- Returns: The value if the key exists and hasn't expired, `null` otherwise.

#### `delete(key: string): boolean`

Removes a key from the cache.

- `key`: The key to be deleted.
- Returns: `true` if the key was successfully deleted, `false` otherwise.

#### `hasKey(key: string): boolean`

Checks if a key exists in the cache.

- `key`: The key to be checked
- Returns: `true` if the key exists, `false` otherwise

## License 📜

Bun Cache is distributed under the MIT License.
