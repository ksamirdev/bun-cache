# <img src="https://user-images.githubusercontent.com/709451/182802334-d9c42afe-f35d-4a7b-86ea-9985f73f20c3.png" alt="Logo" height=30 align="center"> Bun Cache

[![CI](https://github.com/ksamirdev/bun-cache/actions/workflows/ci.yml/badge.svg)](https://github.com/ksamirdev/bun-cache/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@ksamirdev/bun-cache.svg)](https://www.npmjs.com/package/@ksamirdev/bun-cache)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

Bun Cache is a caching library for Bun apps that harnesses the power of the Bun's SQLite to offer a straightforward and efficient caching solution.

## Installation 📦

To get Bun Cache up and running, you can easily install it using bun cli:

```bash
bun add @ksamirdev/bun-cache
```

## Usage 🚀

To leverage Bun Cache, simply create a new instance of the `BunCache` class and start using its methods:

```typescript
import { BunCache } from "@ksamirdev/bun-cache";

const cache = new BunCache(); // new BunCache({ persistent: true }) for persistance

cache.put("my-key", "my-value", 1000); // Store a value with a 1-second TTL
const value = cache.get("my-key");

console.log(value); // 🌟 "my-value"
```

## API 🧰

### `BunCache` Class

- `options`:
  - `persistent`: The persistance mode for the cache. If set to `true`, the cache will be stored in the database and will persist across app restarts. If set to `false`, the cache will be stored in memory and will be lost when the app is restarted.
  - `path`: Custom file path for the SQLite DB (only used when `persistent` is true).

#### `put<T>(key: string, value: T, ttl?: number): boolean`

Adds a value to the cache.

- `key`: The key under which to store the value.
- `value`: The value to be stored (string, object, boolean, null, etc.).
- `ttl`: The time-to-live for the value, in milliseconds.
- Returns: `true` if the value was successfully stored, `false` otherwise.

#### `get<T>(key: string): T | null`

Retrieves the value associated with a key from the cache.

- `key`: The key for which to fetch the value.
- Returns: The value if the key exists and hasn't expired, `null` otherwise.

#### `delete(key: string): boolean`

Deletes a key from the cache.

- `key`: The key to delete.
- Returns: `true` if the key was deleted, `false` otherwise.

#### `clear(): void`

Clears all entries from the cache.

#### `hasKey(key: string): boolean`

Checks if a key exists in the cache and is not expired.

## Development 🛠️

This project uses [Bun](https://bun.sh) for development.

### Scripts

- `bun run build`: Build the project.
- `bun run test`: Run tests.
- `bun run lint`: Check code formatting.
- `bun run format`: Format code.

### Releasing

This project uses `semantic-release` for automated versioning and publishing. Commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

Removes a key from the cache.

- `key`: The key to be deleted.
- Returns: `true` if the key was successfully deleted, `false` otherwise.

#### `hasKey(key: string): boolean`

Checks if a key exists in the cache.

- `key`: The key to be checked
- Returns: `true` if the key exists, `false` otherwise

## License 📜

Bun Cache is distributed under the MIT License.
