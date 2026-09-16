# @nan0web/db-server

<!-- %PACKAGE_STATUS% -->

High-performance HTTP server that exposes `@nan0web/db` via a REST API.
Includes a built-in Midnight-Commander styled Web File Explorer UI with live search,
breadcrumbs, i18n support (`ExplorerModel`), and an interactive OpenAPI spec.

## Installation

How to install with npm?

```bash
npm install @nan0web/db-server
```

How to install with pnpm?

```bash
pnpm add @nan0web/db-server
```

## Quick Start

Launch the server programmatically with an existing `@nan0web/db` instance:

How to start DBServer in Node.js?

```js
// import DB from '@nan0web/db'
// import DBServer from '@nan0web/db-server'
const db = new DB()
const server = await DBServer.create({
	db,
	port: 0,
})
```
## REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service health status |
| `GET` | `/api/help` | OpenAPI 3.0 documentation spec |
| `GET` | `/explorer` | Built-in Web File Explorer interface |
| `GET` | `/api/documents/:uri` | Fetch document (`?mode=fetch` or `?mode=get`) |
| `POST` | `/api/documents` | Create document (`{ uri, document }`) |
| `PUT` | `/api/documents/:uri` | Save document body at URI |
| `DELETE`| `/api/documents/:uri` | Remove document at URI |
| `GET` | `/api/directory/:path` | List directory entries |
| `GET` | `/api/stat/:uri` | Document or folder metadata |

How to verify REST endpoints?

```js
const db = new DB()
const srv = await DBServer.create({ db, port: 0 })
try {
	const res = await fetch(`http://localhost:${srv.server.port}/health`)
	const json = await res.json()
```
## CLI Usage

Run the server directly from the command line on any directory.

### 1. Global installation (Recommended for system-wide use)

```bash
# Install globally via npm or pnpm
npm install -g @nan0web/db-server
# or
pnpm add -g @nan0web/db-server

# Now use 'nan0db' directly anywhere:
nan0db .
nan0db ./data --port 3456
```

### 2. Local execution within workspace or via pnpm/npx

```bash
# In repository workspace:
pnpm exec nan0db .

# Or one-off execution without installation:
npx @nan0web/db-server .
```

How to verify CLI entry point in package.json?

## Web File Explorer UI

Visit `http://localhost:3456/` in your browser to access the Midnight Commander dual-panel interface:

- **Left Panel:** Directory tree with live file search and breadcrumbs navigation.
- **Right Panel:** In-browser JSON/YAML editor with hotkey saving (`Ctrl+S`).
- **Mode Switcher:** Toggle between raw storage reading (`db.get()`) and resolved references (`db.fetch()`).
- **Localization:** Schema-driven texts powered by `ExplorerModel`.


How to verify ExplorerModel defaults?

## TypeScript & Declarations

Fully typed with TypeScript declaration files (`types/index.d.ts`).

How many d.ts files cover it?

## License

ISC License.

How to verify License?


