# Release v1.1.0: Modular `nan0host` CLI, `hosting.nan0`, `sites-available/enabled` & `TrayBarAdapter` (SwiftBar/Argos)

- **Статус:** 🟡 Заплановано (Ready for TDD Implementation)
- **Пакет:** `@nan0web/hosting.app` (`nan0host`)
- **Архітектура:** OLMUI (`Model` + `ModelAsApp` з `@nan0web/ui` / `@nan0web/ui-cli`), Zero-FS (`@nan0web/db`), Data-Driven (`hosting.nan0`, `sites-available/*.nan0`, `sites-enabled/*.nan0`).

---

## 🎯 Критерії Прийомки (Definition of Done)

1. **Моделі конфігурації (Model-as-Schema):**
   - `HostingConfig` (`Model`): `server` (`adapter`, `caddyfile`, `sitesDir`, `localSnippet`), `dns` (`provider`), `paths` (`sitesAvailable`, `sitesEnabled`, `logs`, `locks`).
   - `SiteConfig` (`Model`): `domain`, `port`, `type`, `dir`, `ssl` (`local` | `letsencrypt` | `none`), `docker` (`dir`, `services`), `scripts` (`dev`, `start`, `build`, ...).
2. **Адаптер веб-сервера (`CaddyServerAdapter`):**
   - Генерація `_registry.caddy` виключно з активних сайтів (`sites-enabled/*.nan0`), з підтримкою `ssl: local` (`import local_dev`, `reverse_proxy 127.0.0.1:<port>`) та пропуском ручних `.caddy` файлів.
3. **Адаптер трею (`TrayBarAdapter` для SwiftBar / Argos):**
   - Рендеринг меню формату SwiftBar/Argos (кожен рядок має не більше одного `|`, безпечне екранування).
   - Генерація команд `nan0host` для запуску `dev`/`prod`/`build-and-start`/`stop`/`docker-up` та `proxy reload/start/stop` з `--dir=<envDir>`.
4. **Кросплатформений `SystemAdapter`:**
   - Абстракція перевірки портів, процесів, Docker Compose та DNS (`darwin` / `linux`), без macOS-хардкоду в доменній логіці.
5. **CLI `HostingApp` (`ModelAsApp` + `bootstrapApp`):**
   - Глобальний бінарник `nan0host` (`package.json` `"bin": { "nan0host": "./bin/hosting.js" }`) з підкомандами `site`, `app`, `proxy`, `tray`.
6. **Міграція `/Users/i/env`:**
   - Створення `hosting.nan0`, `hosting.example.nan0`, `sites-available/*.nan0`, симлінків `sites-enabled/*.nan0`.
   - Заміна `dev-proxy.1m.sh` на 3-рядковий тригер `exec nan0host tray --dir="/Users/i/env"`, оновлення `status-daemon.js`, видалення `registry.txt`, `bin/app-runner`, `bin/dev-proxy`.
7. **Tray & Proxy UX у SwiftBar (`nan0host`):**
   - `ProxyCommand` резолвить абсолютний шлях до `Caddyfile` відносно `--dir`, передає `cwd` у `caddy` та веде lock-файл у `cfg.paths.locks`.
   - `TrayCommand` / `TrayBarAdapter` підтримують `binMode` (`bin` | `node`) з абсолютними шляхами, статус Docker/OrbStack (`📡 Запустити OrbStack`), прогрес/помилки сайтів і пункт `📄 View Logs` у проксі та кожному сайті.
