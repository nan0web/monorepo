# MVP Release v1.0.0: Data Models & Server Orchestration

## 1. Scope
Implement the core domain model layer and the Caddy web server orchestration contract for **hosting.app**.

## 2. Acceptance Criteria (DoD)
- [ ] **Data Models (Model-as-Schema)**:
  - `WebDomainSchema`: Represents web hosting domains, active status, SSL configurations, and reverse proxy ports.
  - `MailServerSchema`: Configures SPF/DKIM/DMARC attributes, Rspamd state, and selectors.
  - `MailboxSchema`: Represents mailboxes (quota, passwords, aliases).
  - `CdnSyncSchema`: Manages CDN credentials and proxy status.
- [ ] **Web Server Adapter**:
  - `BaseWebServerAdapter`: Abstract contract defining `addDomain(schema)`, `removeDomain(domain)`, and `updateDomain(schema)`.
  - `CaddyServerAdapter`: Extends `BaseWebServerAdapter` and interacts with Caddy configuration.
- [ ] **Runner Execution (Flow)**:
  - `HostingRunner`: An async generator `async *run(state)` executing domain setup, DNS check, and configuration rendering.

## 3. Architecture Audit
- [x] Indices of the ecosystem reviewed.
- [x] All schemas extend `Model` from `@nan0web/types`.
- [x] Proper validation checks (e.g. FQDN, ports, keys) implemented via static metadata rules.
- [x] Standard ModelError throwing on invalid validation.
