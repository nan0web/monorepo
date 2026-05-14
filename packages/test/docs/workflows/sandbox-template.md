---
description: Створення пісочниці (play/) зі snapshot-тестами для будь-якого пакета чи додатку
---

# 🏖 Sandbox Template (play/ + snapshot tests)

> Джерело патернів: 40+ реальних `play/` директорій монорепо.
> Залежність: `@nan0web/play` — спільні утиліти snapshot-тестування.

## 0. Тип пісочниці

| Тип                | Entry                                | Тести                           |
| ------------------ | ------------------------------------ | ------------------------------- |
| **CLI**            | `play/main.js`                       | `play/snapshot.test.js`         |
| **Web (Lit/HTML)** | `play/index.html` + `play/app.js`    | `play/play.e2e.js` (Playwright) |
| **App**            | `play/index.html` + `play/*.play.js` | `/sandbox-verify`               |
| **Swift/Kotlin**   | `play/ios/` або `play/android/`      | XCTest / Compose snapshots      |
| **Headless**       | `play/main.js`                       | stdout assertions               |

## 1. Структура

```
pkg/
├── play/
│   ├── main.js              # CLI Entry
│   ├── snapshot.test.js      # Golden Master tests
│   ├── index.html            # Web Entry
│   ├── play.e2e.js           # Playwright E2E
│   ├── *.play.js             # Component isolation (App)
│   ├── data/
│   │   ├── index.yaml        # { $ref: [_/langs, _/t] }
│   │   ├── _/langs.yaml      # [{ title: English, locale: en }, ...]
│   │   ├── _/t.yaml          # EN translations
│   │   └── uk/_/t.yaml       # UK translations
│   ├── ios/                  # Swift sandbox
│   └── android/              # Kotlin sandbox
├── snapshots/play/           # .snap (stdout) / .png (screenshots)
├── docs/site/                # Docs Hub з live sandbox
└── package.json
```

## 2. i18n Data Pattern

Мови не hardcoded — беруться з `_/langs.yaml` через DB:

```yaml
# play/data/_/langs.yaml
- title: English
  locale: en
  icon: 🇺🇸
- title: Українська
  locale: uk
  icon: 🇺🇦
```

```yaml
# play/data/index.yaml
$ref: [_/langs, _/t]
```

```yaml
# play/data/_/t.yaml (EN — default)
Select demo: Select demo
Exit: Exit
```

```yaml
# play/data/uk/_/t.yaml (UK override)
Select demo: Обери демо
Exit: Вихід
```

Завантаження у коді:

```javascript
const doc = await db.fetch('index')
const langs = doc.langs.map((l) => l.locale) // ['en', 'uk', ...]
```

## 3. CLI Sandbox — `play/main.js`

```javascript
#!/usr/bin/env node
import process from 'node:process'
import Logger from '@nan0web/log'
import { select } from '@nan0web/ui-cli'
import DBFS from '@nan0web/db-fs'

const dataFs = new DBFS({ root: 'play/data', cwd: import.meta.dirname + '/..' })
let translations = {}

async function loadLocale(locale) {
  const uri = locale === 'en' ? 'index' : `${locale}/index`
  const doc = await dataFs.fetch(uri)
  translations = doc?.t ?? {}
}

function t(key) {
  return translations[key] || key
}

// ─── Demo Scenarios ─────────────────────────
async function demoBasic() {
  /* ... */
}
async function demoAdvanced() {
  /* ... */
}

// ─── DEMO_MAP (обов'язковий для snapshot-тестів) ─────
/** @type {Record<string, () => Promise<void>>} */
const DEMO_MAP = {
  basic: demoBasic,
  advanced: demoAdvanced,
  all: async () => {
    for (const [k, fn] of Object.entries(DEMO_MAP)) {
      if (k !== 'all') await fn()
    }
  },
}

function getArg(flag) {
  const prefix = `--${flag}=`
  const arg = process.argv.find((a) => a.startsWith(prefix))
  return arg ? arg.slice(prefix.length) : undefined
}

async function main() {
  const argLang = getArg('lang')
  const argDemo = getArg('demo')
  await loadLocale(argLang || 'en')

  // Headless mode (snapshot tests)
  if (argDemo) {
    const fn = DEMO_MAP[argDemo]
    if (!fn) {
      console.error(`Unknown: ${argDemo}`)
      process.exit(1)
    }
    await fn()
    return
  }

  // Interactive mode — select menu loop
  const log = new Logger({ level: 'info', icons: true, chromo: true })
  while (true) {
    const options = [...Object.keys(DEMO_MAP).filter((k) => k !== 'all'), '← Exit']
    const choice = await select({ title: t('Select demo:'), options, console: log })
    if (options[choice.index].startsWith('←')) break
    await DEMO_MAP[Object.keys(DEMO_MAP)[choice.index]]()
  }
}

process.on('SIGINT', () => process.exit(0))
main().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

**Ключове**: `DEMO_MAP` + `--demo=`/`--lang=` = headless mode для snapshot-тестів.

## 4. Snapshot Test — `play/snapshot.test.js`

> `normalizeOutput()` та `verifySnapshot()` — з `@nan0web/play`.

```javascript
import { describe, it } from 'node:test'
import { normalizeOutput, verifySnapshot } from '@nan0web/play'
import DBFS from '@nan0web/db-fs'

// Авто-детекція мов з _/langs.yaml
const db = new DBFS({ root: 'play/data', cwd: import.meta.dirname + '/..' })
const doc = await db.fetch('index')
const LANGUAGES = doc.langs.map((l) => l.locale)

const SCENARIOS = [
  { name: 'basic', demo: 'basic' },
  { name: 'advanced', demo: 'advanced' },
]

describe('Snapshot Verification', () => {
  for (const lang of LANGUAGES) {
    describe(`[${lang}]`, () => {
      for (const s of SCENARIOS) {
        it(`${s.name} [${lang}]`, async () => {
          await verifySnapshot({
            name: `${s.name}.${lang}`,
            demo: s.demo,
            lang,
            env: s.seq ? { PLAY_DEMO_SEQUENCE: s.seq } : {},
            entryPoint: 'play/main.js',
          })
        })
      }
    })
  }
})
```

## 5. Web E2E + Screenshot Snapshots

```javascript
import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { verifyScreenshot } from '@nan0web/play'

describe('Web Sandbox E2E', () => {
  let browser, page
  before(async () => {
    browser = await chromium.launch()
    page = await browser.newPage()
  })
  after(async () => {
    if (browser) await browser.close()
  })

  test('renders + screenshot snapshot', async () => {
    await page.goto('http://127.0.0.1:PORT')
    await page.locator('#sandbox').waitFor({ state: 'visible' })
    await verifyScreenshot({ page, name: 'main-render', snapshotDir: 'snapshots/play/web' })
  })
})
```

## 6. Sandbox + Docs Integration

Пісочниця = частина документації (еталон: `packages/ui` Master IDE).

- Кожен компонент у docs-сайті МАЄ посилання на sandbox
- Sandbox МАЄ посилання на docs
- `docs/site/` і `play/` — єдина екосистема

## 7. `@nan0web/play` — Shared Package (NW-9)

```javascript
// normalize.js — ANSI/spinner/progress нормалізація
export function normalizeOutput(str) { ... }

// verify.js — CLI snapshot verification через DB
export async function verifySnapshot({ name, demo, lang, env, entryPoint }) { ... }

// screenshot.js — Playwright screenshot snapshots
export async function verifyScreenshot({ page, name, snapshotDir }) { ... }
```

## 8. package.json scripts

```json
{
  "play": "node play/main.js",
  "play:web": "vite play/ --port PORT",
  "test:e2e": "node --test play/play.e2e.js",
  "test:snapshot": "node --test play/snapshot.test.js",
  "test:snapshot:update": "UPDATE_SNAPSHOTS=1 node --test play/snapshot.test.js"
}
```

## 9. Чеклист

// turbo-all

1. Створи `play/`, визнач тип
2. Entry point (`main.js` / `index.html`)
3. i18n: `play/data/` з `_/langs.yaml` + `_/t.yaml` + `uk/_/t.yaml`
4. `DEMO_MAP` + `--demo=`/`--lang=` для CLI
5. Snapshot тести через `@nan0web/play` для **всіх мов з langs**
6. Інтеграція з docs-сайтом
7. Скрипти в `package.json`, перевір `pnpm test:all`

## 10. ЗАБОРОНЕНО

- ❌ Hardcoded `['en', 'uk']` — мови з `_/langs.yaml`
- ❌ `node:fs`/`node:path` для snapshot I/O — `@nan0web/play`
- ❌ Copy-paste `normalizeOutput()`/`verifySnapshot()` — імпорт з `@nan0web/play`
- ❌ Sandbox без docs-інтеграції
- ❌ `waitForTimeout()` — `waitFor({ state: 'visible' })`
- ❌ Мутація стану між демо

## 11. Reference

| Пакет        | Тип | Особливість                         |
| ------------ | --- | ----------------------------------- |
| `ui-cli`     | CLI | 34 Golden Master snapshots × 2 мови |
| `telemetry`  | CLI | DEMO_MAP + i18n                     |
| `icons`      | Web | Playwright E2E + filters            |
| `editor`     | Lit | Lit components E2E                  |
| `editor.app` | App | `.play.js` isolation                |
| `ui`         | Hub | **Еталон** sandbox + docs           |
