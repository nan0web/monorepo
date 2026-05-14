# @nan0web/http

| [Status](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв) | Documentation                                                                                                                                           | Test coverage | Features                           | Npm version |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------- | ----------- |
| 🟢 `99.2%`                                                                            | 🧪 [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/http/blob/main/README.md)<br />[Українською 🇺🇦](https://github.com/nan0web/http/blob/main/docs/uk/README.md) | 🟢 `95.7%`    | ✅ d.ts 📜 system.md 🕹️ playground | 1.0.0       |

HTTP classes for nan0web

## Installation

How to install with npm?

```bash
npm install @nan0web/http
```

How to install with pnpm?

```bash
pnpm add @nan0web/http
```

How to install with yarn?

```bash
yarn add @nan0web/http
```

## Usage

### HTTP Status Codes

A dictionary of HTTP status codes and their descriptions.

How to get HTTP status text by code?

```js
import { HTTPStatusCode } from '@nan0web/http'
console.info(HTTPStatusCode.get(200)) // OK
console.info(HTTPStatusCode.get(404)) // Not Found
console.info(HTTPStatusCode.get(418)) // I'm a teapot (RFC 2324)
```

### HTTP Errors

Custom error classes for HTTP-related errors.

How to create an HTTPError instance?

```js
import { HTTPError } from '@nan0web/http'
try {
  throw new HTTPError('Bad Request', 400)
} catch (/** @type {any} */ error) {
  console.info(error.toString()) // HTTPError [400] Bad Request\n<stack trace>
}
```

How to create an AbortError instance?

```js
import { AbortError } from '@nan0web/http'
try {
  throw new AbortError('Request was cancelled by user')
} catch (/** @type {any} */ error) {
  console.info(error.name) // AbortError
  console.info(error.message) // Request was cancelled by user
}
```

### HTTP Headers

A class for managing HTTP headers that supports multiple input formats.

How to create HTTPHeaders from object?

```js
import { HTTPHeaders } from '@nan0web/http'
const headers = new HTTPHeaders({
  'Content-Type': 'application/json',
  Authorization: 'Bearer secret-token',
  'User-Agent': 'nan0web-http-client/1.0',
})
console.info(headers.toString())
// Content-Type: application/json
// Authorization: Bearer secret-token
// User-Agent: nan0web-http-client/1.0
```

How to create HTTPHeaders from array?

```js
import { HTTPHeaders } from '@nan0web/http'
const headers = new HTTPHeaders([
  ['accept', 'application/json'],
  ['x-api-key', 'key123'],
])
console.info(headers.toString()) // Accept: application/json\nX-Api-Key: key123
```

How to create HTTPHeaders from string?

```js
import { HTTPHeaders } from '@nan0web/http'
const headers = new HTTPHeaders('Content-Type: text/html\nX-Request-ID: abc123')
console.info(headers.toString()) // Content-Type: text/html\nX-Request-ID: abc123
```

How to manipulate HTTPHeaders?

```js
import { HTTPHeaders } from '@nan0web/http'
const headers = new HTTPHeaders()
headers.set('Cache-Control', 'no-cache')
headers.set('Accept-Language', 'en-US,en;q=0.9')
console.info(headers.size) // 2
console.info(headers.has('Cache-Control')) // true
console.info(headers.get('Cache-Control')) // no-cache
console.info(JSON.stringify(headers.toObject(), null, 2))
// {
//   "Cache-Control": "no-cache",
//   "Accept-Language": "en-US,en;q=0.9"
// }
```

### HTTP Message

Base class for HTTP messages with URL, headers, and optional body.

How to create an HTTPMessage instance?

```js
import { HTTPMessage } from '@nan0web/http'
const message = new HTTPMessage({
  url: '/api/test',
  headers: {
    'Content-Type': 'application/json',
  },
  body: '{"test": true}',
})
console.info(message.toString())
// </api/test>
// Content-Type: application/json

// {"test": true}
```

### HTTP Incoming Message

Extends HTTPMessage to represent client requests with methods.

How to create an HTTPIncomingMessage instance?

```js
import { HTTPIncomingMessage } from '@nan0web/http'
const getRequest = new HTTPIncomingMessage({
  method: 'GET',
  url: '/api/users',
  headers: {
    Accept: 'application/json',
    'User-Agent': 'nan0web-client/1.0',
  },
})
console.info(getRequest.toString())
// GET </api/users>
// Accept: application/json
// User-Agent: nan0web-client/1.0
```

How to validate HTTP methods?

```js
import { HTTPMethodValidator } from '@nan0web/http'
console.info(HTTPMethodValidator('GET')) // GET
console.info(HTTPMethodValidator('INVALID')) // throws TypeError
```

### HTTP Response Message

Extends HTTPMessage to represent server responses with status information.

How to create an HTTPResponseMessage instance?

```js
import { HTTPResponseMessage } from '@nan0web/http'
const successResponse = new HTTPResponseMessage({
  url: '/api/users',
  status: 200,
  statusText: 'OK',
  ok: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Response-Time': '45ms',
  },
  body: JSON.stringify([
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' },
  ]),
})
console.info(successResponse.status) // 200
console.info(successResponse.statusText) // OK
console.info(successResponse.ok) // true
console.info(await successResponse.text()) // [{"id":1,"name":"John"},{"id":2,"name":"Jane"}]
```

How to clone an HTTPResponseMessage instance?

```js
import { HTTPResponseMessage } from '@nan0web/http'
const original = new HTTPResponseMessage({
  url: '/api/data',
  status: 200,
  body: 'Hello world',
})
const cloned = original.clone()
console.info(original.url) // /api/data
console.info(cloned.url) // /api/data
console.info((await original.text()) === (await cloned.text())) // true
```

## API

### HTTPStatusCode

- **Methods**
  - `static get(code)` – Returns status text for a given code or "Unknown" if not found.

### AbortError

Extends `Error`.

- **Constructor**
  - `new AbortError(message = "Request aborted")` – Creates an AbortError with optional custom message.

### HTTPError

Extends `Error`.

- **Properties**
  - `status` – HTTP status code.

- **Constructor**
  - `new HTTPError(message, status = 400)` – Creates an HTTPError with message and status code.

- **Methods**
  - `toString()` – Returns formatted error string with status, message, and stack trace.

### HTTPHeaders

- **Properties**
  - `size` – Number of headers.

- **Constructor**
  - `new HTTPHeaders(input = {})` – Creates headers from object, array, or string.

- **Methods**
  - `has(name)` – Returns true if header exists.
  - `get(name)` – Returns header value.
  - `set(name, value)` – Sets a header.
  - `delete(name)` – Deletes a header.
  - `toArray()` – Returns array of formatted header strings.
  - `toString()` – Returns string representation of all headers.
  - `toObject()` – Returns object with header names and values.
  - `static from(input)` – Returns existing instance or creates new one.

### HTTPMessage

- **Properties**
  - `url` – Request/Response URL.
  - `headers` – HTTPHeaders instance.
  - `body` – Optional message body.

- **Constructor**
  - `new HTTPMessage(input = {})` – Creates message with URL, headers, and optional body.

- **Methods**
  - `toString()` – Returns string representation of the message.
  - `static from(input)` – Returns existing instance or creates new one.

### HTTPIncomingMessage

Extends `HTTPMessage`.

- **Properties**
  - `method` – HTTP method (GET, POST, etc.).

- **Constructor**
  - `new HTTPIncomingMessage(input = {})` – Creates incoming message with method.

- **Methods**
  - `toString()` – Returns string representation including method.
  - `static from(input)` – Returns existing instance or creates new one.

### HTTPMethods

Static constants for HTTP methods:

- `HTTPMethods.GET`
- `HTTPMethods.POST`
- `HTTPMethods.PATCH`
- `HTTPMethods.PUT`
- `HTTPMethods.DELETE`
- `HTTPMethods.HEAD`
- `HTTPMethods.OPTIONS`

### HTTPMethodValidator

Function that validates HTTP method strings against allowed methods.

### HTTPResponseMessage

Extends `HTTPMessage`.

- **Properties**
  - `ok` – Boolean indicating if status is successful (2xx).
  - `status` – HTTP status code.
  - `statusText` – Status text description.
  - `type` – Response type (basic, cors, etc.).
  - `redirected` – Boolean indicating if response was redirected.

- **Constructor**
  - `new HTTPResponseMessage(input = {})` – Creates response message with status info.

- **Methods**
  - `clone()` – Returns a cloned response message.
  - `json()` – Returns JSON-parsed body.
  - `text()` – Returns body as string.

All exported classes should pass basic test to ensure API examples work

## Java•Script

Uses `d.ts` files for autocompletion

## CLI Playground

How to run playground script?

```bash
# Clone the repository and run the CLI playground
git clone https://github.com/nan0web/http.git
cd http
npm install
npm run play
```

## Contributing

How to contribute? - [check here](./CONTRIBUTING.md)

## License

How to license ISC? - [check here](./LICENSE)
