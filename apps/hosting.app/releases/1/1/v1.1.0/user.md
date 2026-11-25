# Release v1.1.0: User & Architect Tracking

- **Дата початку:** 2026-11-19
- **Мета:** Модульний CLI `nan0host`, data-driven конфіги `hosting.nan0` та `sites-available/*.nan0`, адаптер трею `TrayBarAdapter`, кросплатформений `SystemAdapter`, міграція `/Users/i/env`.

---

## 📝 Журнал Ітерацій та Рішень

### Ітерація 1 — Ініціалізація та Реалізація Ядра `@nan0web/hosting.app`
- Реалізовано `HostingConfig` та `SiteConfig` (`Model-as-Schema` з `@nan0web/types`).
- Оновлено `CaddyServerAdapter` з підтримкою `ssl: local` (`import local_dev`, `reverse_proxy 127.0.0.1:<port>`) та генерації `_registry.caddy` з пропуском ручних `.caddy` файлів.
- Створено `TrayBarAdapter` (SwiftBar/Argos рендерер із захистом від зайвих `|`).
- Створено кросплатформений `SystemAdapter` (`darwin` / `linux`).
- Створено `HostingApp` (`ModelAsApp`) з підкомандами `site`, `app`, `proxy`, `tray` (Zero-FS через `$db`) та `bin/hosting.js` (`bootstrapApp`).

### Ітерація 2 — Верифікація CLI `nan0host` та Міграція `/Users/i/env`
- Виправлено `bin/hosting.js` (передача `{ db, root: envDir }` у `bootstrapApp` без зайвих ключів).
- Злінковано глобальний бінарник `nan0host` (`/Users/yaro/Library/pnpm/nan0host`) та перевірено `nan0host tray --dir=/Users/i/env` і `nan0host site list --dir=/Users/i/env`.
- Створено `/Users/i/env/hosting.nan0`, `hosting.example.nan0`, `sites-available/*.nan0` та симлінки `sites-enabled/*.nan0`.
- Замінено `/Users/i/env/src/ui-swift/dev-proxy.1m.sh` на тригер `exec nan0host tray --dir="/Users/i/env"`.
- За зауваженням Архітектора `env/bin/status-daemon.js` не змінювався.
- Видалено застарілі `/Users/i/env/registry.txt`, `/Users/i/env/bin/app-runner`, `/Users/i/env/bin/dev-proxy`.

### Ітерація 3 — Виправлення зауважень ревʼю та підключення `nan0inspect`
- Підключено `@nan0web/inspect` (`test:inspect`, `inspect`) у `package.json` та `test:all`.
- Декомпозовано `HostingConfig` на моделі `ServerConfig`, `DnsConfig`, `PathsConfig`; `SiteConfig` на `DockerConfig`, `ScriptsConfig`; `dockerDir` і `dockerServices` перетворено на гетери.
- Прибрано заглушки з `CaddyServerAdapter`, прибрано хардкод `EXTRA_PATH` із `SystemAdapter`.
- Додано i18n (`static UI` + `t()`) у `TrayBarAdapter` та сповіщення `AppCommand`.
- Додано шаблон `apps/hosting.app/templates/hosting.example.nan0`.
- Виправлено `PATH` для `node` у `/Users/i/env/src/ui-swift/dev-proxy.1m.sh` — SwiftBar-скрипт перевірено з мінімальним `PATH`.

### Ітерація 4 — Tray & Proxy UX у SwiftBar (`nan0host`)
- Контракт з `nan0host-tray-and-proxy-fixes.md` інтегровано у `v1.1.0` за рішенням Архітектора.
- Іконку запуску OrbStack узгоджено як `📡 Запустити OrbStack`.
- Режим формування `bash=` у SwiftBar винесено у параметр `binMode` (`bin` | `node`) у `TrayConfig` / `TrayCommand` / `TrayBarAdapter`.
- **Зауваження Архітектора (18:34):** При абсолютному шляху в `cfg.server.caddyfile` (`open /Users/i/env/api/sites/Users/i/env/api/sites/caddy/Caddyfile: no such file or directory`) відбувалося подвоєння шляху в `resolveEnvPath()`. Додано контрактний тест і фікс: абсолютний `relUri` повертається без префікса `base`.
- **Зауваження Архітектора (19:01):** При натисканні `Docker Compose Up` та `Start Prod/Dev` у SwiftBar (`dev-proxy`) потрібно одразу записувати lock-стан (`⏳ Starting...`), миттєво тригерити `swiftbar://refreshplugin?name=dev-proxy`, а після завершення прибирати lock і ще раз оновлювати SwiftBar. Винесено спільний `AppCommand.withSiteLock()`, підключено до `docker-up` та `startBackground` (`start-dev`, `start-prod`, `build-and-start-bg`), додано 2 контрактні тести у `task.spec.js`.
- **Зауваження Архітектора (00:21):** При натисканні `Start Prod Mode` у SwiftBar з мінімальним `PATH` запуск падав з `ENOENT: no such file or directory, open 'data/logs/prod-4004.log'` (бо `AppCommand.startBackground()` передавав відносний `db.resolveSync(this.dir, '', logUri)` замість абсолютного шляху, а `process.cwd()` у SwiftBar != `--dir`), а також у `SystemAdapter.buildEnv()` бракувало `~/Library/pnpm`, `~/homebrew/bin` та `~/.orbstack/bin` для пошуку `pnpm`/`docker`. Винесено спільний `resolveEnvPath(db, dir, relUri)` у `hostingContext.js`, оновлено `AppCommand`, `TrayCommand` та `SystemAdapter`, додано контрактні тести у `task.spec.js`.
