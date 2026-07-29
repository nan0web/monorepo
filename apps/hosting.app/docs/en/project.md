# 🏗️ project.md: hosting.app (Sovereign Server Manager)

## 🧭 Phase 1: Philosophy and Abstraction (The Seed)

### 1. Mission and Philosophy (aaPanel Context & Constraints)
Traditional server control panels (such as aaPanel) suffer from critical architectural deficiencies:
* **Opaque and Buggy Mail System Validation:** Hardcoded validation checks (e.g. forcing local MX/PTR records for secondary domains instead of using a unified infrastructure core) lead to SSL failures or incorrect mail delivery.
* **Monolithic Web Server Coupling:** Inability to easily replace the web server or dynamically switch between them without manually rewriting custom shell scripts.
* **Lack of Proper API Orchestration:** Configuration changes require service restarts instead of dynamic updates via APIs.

**hosting.app** is a fully-featured sovereign hosting manager that goes far beyond a simple mail server, covering:
1. **Web Hosting Management:** Domain creation, static site hosting, and reverse proxying for backend applications (Node.js, Go, Python, etc.).
2. **Mail Server Management:** Infrastructure for mail domains, selectors, and individual mailboxes.
3. **CDN, DNS & Caching:** Integration with Cloudflare/BunnyCDN to sync records and manage Cache-Tags.

---

### 2. Web Server Abstraction and the Choice of Caddy
To ensure flexibility, the web hosting layer is built on the **interchangeable adapter** pattern (`BaseWebServerAdapter`). This allows support for any web server:

* **Caddy (Default Choice):**
  * *Advantages:* Provides out-of-the-box automated Let's Encrypt SSL certificate generation without relying on external utilities (like certbot). Features a robust dynamic JSON API, enabling domain additions and routing modifications on the fly without service restarts.
  * *Disadvantages:* Benchmarks show Caddy has approximately **15% higher latency** compared to the extremely fast Nginx.
* **Nginx (Alternative Adapter):**
  * *Advantages:* Maximum speed for static files and connection processing.
  * *Disadvantages:* More complex configuration management for dynamic routing updates without restarts.

The core `HostingRunner` logic interacts solely with the adapter methods (`addDomain`, `removeDomain`). The initial MVP launches with the Caddy adapter for automated SSL and routing ease, but the architecture is ready for a drop-in Nginx adapter in the future.

---

## 📐 Phase 2: Domain Modeling (Data-Driven Models)

Server management schemas describe the full spectrum of hosting features (located in `src/domain/`):

1. **`WebDomainSchema` (Websites):**
   * Describes domains, site roots (`root`), active status, SSL configurations, and internal reverse proxy ports (`proxy_port`).
2. **`MailServerSchema` (Mail Infrastructure):**
   * Sets mail domain parameters, DKIM key sizes, selectors, and spam filter states.
3. **`MailboxSchema` (Mailboxes):**
   * Describes mailboxes, quota limits, passwords, and forwarding rules.
4. **`CdnSyncSchema` (CDN Settings):**
   * Manages CDN API tokens and proxy status.

### 3. Smart Mail Validation & Blacklist API Specifications
Unlike the rigid and buggy validators found in aaPanel, `hosting.app` implements a mathematically sound model for verifying DNS records on multi-tenant servers:

#### A. MX (Mail Exchange) Validation
* **The aaPanel Bug:** Forces the MX record of each tenant domain to point strictly to its own subdomain (e.g., `mail.tenant.com`), throwing a validation failure otherwise.
* **The hosting.app Solution:** The system queries the MX record of the domain (`tenant.com`). If it points to any host (e.g., `mail.eaukraine.eu`), the system resolves that host. If the resolved IP address matches our server's IP (`142.132.174.234`), the MX status is marked as **OK**. This enables sharing a single infrastructure core across all client domains.

#### B. PTR (Reverse DNS) Validation
* **The aaPanel Bug:** Tries to verify a separate PTR record for each individual domain, which is technically impossible since a single IP address can only have one PTR record.
* **The hosting.app Solution:** The system checks the PTR record of the server's IP address. If the resolved hostname (e.g., `mail.eaukraine.eu`) resolves back to our server's IP (Forward-Confirmed Reverse DNS), the PTR status is considered **valid for all domains hosted on this server**.

#### C. SPF Validation
* Verifies if the domain's TXT record contains the `mx` directive (which authorizes our validated MX server) or explicitly includes our server's IP address.

#### D. DKIM Validation
* The system performs a DNS TXT lookup at `{selector}._domainkey.{domain}`.
* The fetched value is parsed to confirm it starts with `v=DKIM1` and contains the public key field `p=`. If found and verified, the status is marked as **OK**.

#### E. DMARC Validation
* The system performs a DNS TXT lookup at `_dmarc.{domain}`.
* The fetched value is parsed to confirm it starts with `v=DMARC1` and includes the policy tag `p=` (e.g. `p=none`, `p=quarantine`, or `p=reject`).

#### F. Blacklist Monitor API Integration
* A background utility periodically performs parallel DNS lookups against global Real-time Blackhole Lists (RBLs) like Spamhaus, Barracuda, and Spamcop for the server's IP address.
* If the IP is detected on any list, the system immediately generates an alert via the API and displays a warning in the admin dashboard.

---

## 🛠 Phase 3: Logic Verification (CLI-First)

All hosting configuration and web server management logic is fully functional via the command line. Website provisioning, proxy routing, and DNS resolutions are covered by automated Snapshot tests.
