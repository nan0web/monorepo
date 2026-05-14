# @nan0web/auth (Pasportal Core)

The core implementation of the **Sovereign Identity Protocol**.
This package provides the logic for issuing tokens, managing scopes, and mediating access between Users and Applications.

## 🏗️ Architecture

### 1. The Trinity of Trust

- **Subject**: The User (Sovereign).
- **Client**: The App requesting access (e.g. Advocates).
- **Mediator**: The Auth Service (this package).

### 2. Scopes & Permissions

Permissions are granular and explicit.

- `identity.email`: Read email address.
- `payment.charge`: Request a payment.
- `social.post`: Publish to the user's feed.

## 🚀 Usage

```javascript
import { Auth, Scope } from '@nan0web/auth'

// 1. Define Request
const request = {
  clientId: 'advocates.nyc',
  scopes: [Scope.IDENTITY_EMAIL, Scope.PAYMENT_CHARGE],
}

// 2. Ask for Consent (returns a Flow)
await runFlow(Auth.askConsent(request), adapter)
```
