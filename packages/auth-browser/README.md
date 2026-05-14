# @nan0web/auth-browser
<!-- %PACKAGE_STATUS% -->

Authentication browser client with password and social sign-in support.

## Features

- **Password Authentication**: Username/password registration, sign-in, and password reset.
- **Social Sign-in**: Google, Facebook, LinkedIn authentication support.
- **Token Management**: Automatic token handling and refresh functionality.
- **User Operations**: User data retrieval and account management.
- **Security**: Built-in token expiry service and protected route access control.
- **DX Transparency**: Fully covered with tests, zero-dependency, pure JavaScript with JSDoc.

## Installation

```bash
npm install @nan0web/auth-browser
```

## Usage
### Browser Client
Auto-detects current window location or uses custom config.

How to initialize AuthClient?
```js
import AuthClient from '@nan0web/auth-browser'
const auth = await AuthClient.create({
	cwd: 'http://localhost',
	root: '/api/auth/',
	fetchFn: createMockFetch([])
})
console.info('Auth client created')
```
### Password Authentication
Register a new user and sign in with credentials.

How to register and sign in?
```js
import AuthClient from '@nan0web/auth-browser'
const auth = await AuthClient.create({
	cwd: 'http://localhost',
	fetchFn: createMockFetch([
		['POST /auth/signup.json', { message: 'Verification code sent' }],
		['POST /auth/signin/user.json', { token: 'mock-jwt-token' }]
	])
})
// Register new account
const signup = await auth.register({ username: 'user', password: 'pass' })
console.info(signup.message) // ← Verification code sent
// Sign in
const signin = await auth.signIn('user', 'pass')
console.info('Token received') // ← Token received
```
### Social Authentication
Authentication with third-party providers (Google, Facebook, etc).

How to use social providers?
```js
import AuthClient from '@nan0web/auth-browser'
const auth = await AuthClient.create({
	cwd: 'http://localhost',
	fetchFn: createMockFetch([
		['POST /auth/google.json', { token: 'google-jwt-token' }]
	])
})
const google = await auth.authWithProvider('google', 'google-token')
console.info('Social auth successful')
if ('token' in google) {
```
### User Operations
Manage user data and list available profiles.

How to manage user profile?
```js
import AuthClient from '@nan0web/auth-browser'
const auth = await AuthClient.create({
	cwd: 'http://localhost',
	fetchFn: createMockFetch([
		['GET /auth/signin/user1.json', { name: 'John Doe', email: 'john@example.com' }],
		['GET /auth/info.json', [200, ['user1', 'user2']]]
	])
})
// Get user data
const user = await auth.getUser('user1')
console.info(user.name) // ← John Doe
// List all usernames
const users = await auth.listUsers()
console.info(`Found ${users.length} users`) // ← Found 2 users
```
### Token Management
Refresh authentication token using existing one.

How to refresh tokens?
```js
import AuthClient from '@nan0web/auth-browser'
const auth = await AuthClient.create({
	cwd: 'http://localhost',
	token: 'old-token',
	fetchFn: createMockFetch([
		['PUT /auth/refresh/old-token.json', { token: 'new-mock-token' }]
	])
})
const refresh = await auth.refreshToken()
console.info('Token refreshed')
if ('token' in refresh) {
```
## Contributing
Please read our [contributing guidelines](./CONTRIBUTING.md).

## License
[ISC License](./LICENSE) - Copyright (c) 2025, ЯRаСлав (YaRaSlove)

All exported classes should pass basic test
