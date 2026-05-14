---
description: Seed — LLimo Knowledge Base (Living Knowledge System)
version: 0.1.0
status: seed
priority: high
---

# 🧠 LLimo Knowledge Base — Living Knowledge System

> **Місія:** Забезпечити будь-якій моделі (локальній чи хмарній) актуальні, структуровані знання про код та документацію в межах `--cwd`, з автоматичним виявленням та індексацією зовнішніх залежностей.

## Абстракція

LLimo KB — це **мово-агностична система індексації та пошуку**, яка працює як "живий мозок" для AI-агентів. Вона вирішує головну проблему LLM: модель навчена на старій версії коду, а проект уже на новій. KB забезпечує модель свіжим контекстом через локальний індекс.

## Архітектурні Принципи

1. **Суверенітет CWD**: За замовчуванням працює в поточній директорії. Параметр `--cwd` дозволяє вказати будь-який проект.
2. **Hash-Інвалідація**: Кожен індекс має `hash.txt`. При зверненні до пошуку система порівнює хеш — якщо застарів, автоматично переіндексовує перед пошуком.
3. **Каскадний пошук**: Без `--in` шукає послідовно: CWD → інші локальні проєкти → зовнішні пакети (`~/.llimo/kb/@/`).
4. **Автовиявлення залежностей**: Система аналізує `package.json`, `Cargo.toml`, `go.mod`, `requirements.txt` тощо. При першому зверненні до незавантаженого пакета — запитує дозвіл на завантаження.
5. **Без Docker**: Проста файлова структура `~/.llimo/kb/`. Зовнішні пакети отримуються через `npm install --ignore-scripts` (або еквівалент для мови).

## Файлова Структура KB

```text
~/.llimo/
  config.yaml                               # Глобальні налаштування
  kb/
    @/                                       # Зовнішні пакети
      npmjs.com/
        @nan0web/
          ui-cli/
            .datasets/
              workspace-index.bin            # Бінарний індекс (вектори)
              workspace-index.bin.meta.json  # Метадані чанків
              workspace-index.csv            # Текстовий індекс (grep/дебаг)
              hash.txt                       # Хеш стану для інвалідації
            package.json
            src/
            README.md
      github.com/
        user/repo/
          ...
      pypi.org/
        pandas/
          ...
      crates.io/
        serde/
          ...
    local/                                   # Проіндексовані локальні проєкти
      nan.web/
        packages/0HCnAI.framework/
          .datasets/ → symlink до CWD/.datasets/
```

## Команди CLI

```bash
# Індексація локального проету (CWD)
llimo index                              # індексує ./ → .datasets/

# Індексація із зазначенням CWD
llimo index --cwd ~/src/apps/horod

# Індексація зовнішнього пакета (з явним реєстром)
llimo index npm:@nan0web/ui-cli          # → ~/.llimo/kb/@/npmjs.com/@nan0web/ui-cli/
llimo index pip:pandas                   # → ~/.llimo/kb/@/pypi.org/pandas/
llimo index crates:serde                 # → ~/.llimo/kb/@/crates.io/serde/
llimo index go:github.com/gorilla/mux    # → ~/.llimo/kb/@/go.pkg/github.com/gorilla/mux/
llimo index composer:laravel/framework   # → ~/.llimo/kb/@/packagist.org/laravel/framework/
llimo index pub:flutter/material         # → ~/.llimo/kb/@/pub.dev/flutter/material/
llimo index github:user/repo             # → ~/.llimo/kb/@/github.com/user/repo/

# Без префіксу → автовизначення з контексту CWD:
#   package.json → npm, requirements.txt → pip, Cargo.toml → crates, go.mod → go
#   Якщо конфлікт між реєстрами → інтерактивне питання
llimo index @nan0web/ui-cli              # CWD має package.json → npm

# Пошук (з автоінвалідацією хешу)
llimo search "renderForm options"        # каскад: CWD → local → external

# Пошук по конкретному пакету
llimo search "renderForm" --in @nan0web/ui-cli

# Пошук по всіх залежностях поточного проекту
llimo search "Model" --deps

# Примусовий пошук скрізь (ігнорує Smart Stop)
llimo search "Model" --force-all

# Пошук ТІЛЬКИ у зовнішніх пакетах (пропускає CWD та local)
llimo search "Model" --external-only
```

## Каскад Пошуку (без --in)

```text
llimo search "renderForm"

# 1. CWD/.datasets/                ← Локальний проект (пріоритет)
# 2. ~/.llimo/kb/local/...         ← Інші проіндексовані локальні проєкти
# 3. ~/.llimo/kb/@/...             ← Зовнішні пакети

# Автовиявлення залежностей:
#   Бачить import '@nan0web/ui-cli' у результатах →
#   Перевіряє ~/.llimo/kb/@/npmjs.com/@nan0web/ui-cli/ →
#   Якщо НЕ існує: "⬇ Завантажити @nan0web/ui-cli для глибшого пошуку? [Y/n]"
#   Якщо існує але hash застарів: тихо переіндексовує
#   Якщо існує і свіжий: додає результати
```

### Стоп-правила каскаду

Каскад **зупиняється**, коли виконується будь-яка з умов:

| Параметр | За замовчуванням | Опис |
| :--- | :--- | :--- |
| `--limit` | `10` | Максимум результатів. Каскад зупиняється коли набрано. |
| `--depth` | `all` | Глибина: `cwd` (лише локально), `local` (+ інші проєкти), `all` (+ зовнішні) |
| `--threshold` | `0.75` | Мінімальна релевантність (0–1). Нерелевантні не рахуються. |
| `--no-external` | `false` | Примусово зупинити каскад перед зовнішніми пакетами |

**Розумне правило (Smart Early Stop):**
Якщо CWD дав `≥ limit` результатів із релевантністю `≥ 0.85` — зовнішні пакети **не опитуються взагалі**. Це означає: "мИ знайшли досить якісних відповідей вдома, нема потреби шукати ззовні."

```text
# Приклад Smart Early Stop:
llimo search "Model" --limit 10

# CWD → 12 результатів, середня релевантність 0.91
# → Smart Stop: достатньо локальних, каскад завершено
# → Повертає top-10 за релевантністю

# Приклад повного каскаду:
llimo search "renderForm" --limit 10

# CWD → 2 результати (потрібно ще 8)
# local → 3 результати (потрібно ще 5)
# external (@nan0web/ui-cli) → 7 результатів
# → Повертає top-10 за релевантністю із зазначенням джерела
```

## Формат workspace-index.csv

```csv
file,line,type,content
src/domain/OrderModel.js,12,static,"static currency = { help: 'Account currency', default: 'UAH' }"
src/domain/OrderModel.js,26,method,"async *run() {"
README.md,1,heading,"# @nan0web/ui-cli"
data/uk/_/t.yaml,5,translation,"Agent Name: 'Назва Агента'"
```

## Що індексуємо (пріоритети)

| Пріоритет | Тип | Приклад |
| :--- | :--- | :--- |
| 1 (Високий) | Документація | `*.md`, `*.txt`, `*.rst` |
| 1 (Високий) | Дані та конфіги | `*.yaml`, `*.nan0`, `*.json`, `*.toml` |
| 2 (Середній) | Вихідний код | `*.js`, `*.py`, `*.rs`, `*.go`, `*.java` тощо |
| 2 (Середній) | Тести та контракти | `*.test.js`, `*.story.js`, `*.spec.py` |
| 3 (Низький) | Стилі (вибірково) | `theme.js`, `styles.css` (не vendor) |
| ❌ Ігноруємо | Бінарні файли | `*.webp`, `*.png`, `*.woff2` |
| ❌ Ігноруємо | Генеровані | `dist/`, `build/`, `node_modules/` |

## Підтримка мов програмування (розширення)

### Web & Mobile
- **JavaScript**: `.js`, `.mjs`, `.cjs`, `.jsx`
- **TypeScript**: `.ts`, `.tsx`, `.mts`, `.cts`
- **HTML**: `.html`, `.htm`, `.vue`, `.svelte`
- **CSS**: `.css`, `.scss`, `.sass`, `.less`
- **Swift**: `.swift`
- **Objective-C**: `.m`, `.mm`
- **Dart**: `.dart` (Flutter)

### Systems
- **Rust**: `.rs`
- **Go**: `.go`
- **C**: `.c`, `.h`
- **C++**: `.cpp`, `.cc`, `.cxx`, `.hpp`, `.h`, `.hxx`
- **Zig**: `.zig`

### JVM
- **Java**: `.java`
- **Kotlin**: `.kt`, `.kts`
- **Scala**: `.scala`, `.sc`

### .NET
- **C#**: `.cs`, `.csx`
- **VB.NET**: `.vb`, `.vbs`
- **F#**: `.fs`, `.fsx`

### Scripting
- **Python**: `.py`, `.pyi`, `.pyw`
- **Ruby**: `.rb`, `.erb`
- **PHP**: `.php`, `.phtml`
- **Lua**: `.lua`
- **Perl**: `.pl`, `.pm`
- **Shell**: `.sh`, `.bash`, `.zsh`, `.fish`
- **PowerShell**: `.ps1`, `.psm1`

### Blockchain
- **Solidity**: `.sol` (Ethereum)
- **Solana**: `.rs` (Anchor/Rust)
- **Move**: `.move` (Aptos/Sui)
- **Cairo**: `.cairo` (StarkNet)

### Data & Config
- **Data**: `.yaml`, `.yml`, `.json`, `.toml`, `.ini`, `.env`
- **NaN0**: `.nan0`
- **CSV**: `.csv`, `.tsv`
- **XML**: `.xml`, `.xsl`, `.xsd`, `.svg`
- **SQL**: `.sql`
- **GraphQL**: `.graphql`, `.gql`
- **Protobuf**: `.proto`

### Docs
- **Markdown**: `.md`
- **Text**: `.txt`
- **reStructuredText**: `.rst`
- **AsciiDoc**: `.adoc`

### Functional
- **Elixir**: `.ex`, `.exs`
- **Haskell**: `.hs`, `.lhs`
- **Clojure**: `.clj`, `.cljs`, `.cljc`
- **OCaml**: `.ml`, `.mli`

## Файли залежностей (для автовиявлення)

| Мова | Файл залежностей |
| :--- | :--- |
| JavaScript/TypeScript | `package.json` |
| Python | `requirements.txt`, `pyproject.toml`, `Pipfile` |
| Rust | `Cargo.toml` |
| Go | `go.mod` |
| Java | `pom.xml`, `build.gradle`, `build.gradle.kts` |
| C# | `*.csproj`, `*.sln` |
| PHP | `composer.json` |
| Ruby | `Gemfile` |
| Dart | `pubspec.yaml` |
| Elixir | `mix.exs` |
| Solidity | `hardhat.config.js`, `foundry.toml` |

## Universal Ignore

```text
node_modules/
dist/
build/
target/
__pycache__/
.venv/
vendor/
.git/
.datasets/
tmp/
*.min.js
*.min.css
*.map
*.lock
```

## Self-Healing AI Strategy (ai-strategy.yaml)

Стратегія виправлення помилок моделі **конфігурується per-project** через файл `data/ai-strategy.yaml`:

```yaml
# data/ai-strategy.yaml — Конфігурація Self-Healing для проекту

# Каскад моделей (від швидкої до потужної)
models:
  - id: nemotron-3-nano
    provider: lmstudio
    priority: 1           # Спочатку пробуємо найшвидшу
  - id: gemini-2.5-flash
    provider: gemini
    priority: 2           # Якщо nano не впоралась
  - id: gemini-2.5-pro
    provider: gemini
    priority: 3           # Важка артилерія

# Глобальні параметри відкату
retry:
  maxRetries: 2           # Максимум спроб на ОДНІЙ моделі (same)
  maxLoops: 1             # Максимум перемикань між моделями (loops)
                          # Тобто: nano(2) → flash(2) → СТОП
                          # maxLoops: 2 → nano(2) → flash(2) → pro(2) → СТОП

# Перевизначення per-task (опціонально)
tasks:
  code-generation:
    maxRetries: 3          # Складна задача — більше спроб
    maxLoops: 2            # Дозволяємо більше перемикань
  translation:
    maxRetries: 1          # Переклад простий — одна спроба достатня
    maxLoops: 0            # Не перемикати модель, одразу помилка
  schema-validation:
    maxRetries: 2
    maxLoops: 1
```

### Алгоритм Self-Healing

```text
Задача: code-generation (maxRetries: 3, maxLoops: 2)

Loop 0: nemotron-3-nano (priority 1)
  Спроба 1 → ❌ Schema validation failed
  Спроба 2 → ❌ Рефлексія: надіслано лог помилки → знову ❌
  Спроба 3 → ❌ Ще одна рефлексія → ❌
  → maxRetries досягнуто → перемикаємо модель

Loop 1: gemini-2.5-flash (priority 2)
  Спроба 1 → ❌ Schema validation failed
  Спроба 2 → ✅ Успіх! → Повертаємо результат

# Якщо б flash теж не впоралась:
Loop 2: gemini-2.5-pro (priority 3)
  Спроба 1 → ✅ Успіх!

# Якщо maxLoops вичерпано і жодна модель не впоралась:
→ ❌ Повернути помилку оператору з логом усіх спроб
```

### Де живе файл

```text
# Per-project (пріоритет):
./data/ai-strategy.yaml
# або
./ai-strategy.yaml

# Глобальний fallback:
~/.llimo/ai-strategy.yaml
```

Llimo шукає конфіг каскадно: спочатку в `CWD/data/`, потім в `CWD/`, потім глобальний.

## Залежності від інших пакетів NaN•Web

- `@nan0web/ai` — провайдери моделей та aiStrategy
- `@nan0web/db-fs` — читання `data/` та конфігів
- `@nan0web/i18n` — локалізація повідомлень KB

## Критерії Приймання (Definition of Done)

- [ ] `llimo index` створює `.datasets/workspace-index.{bin,csv}` + `hash.txt`
- [ ] `llimo search` перевіряє `hash.txt` перед пошуком
- [ ] `llimo search` без `--in` каскадно шукає CWD → local → external
- [ ] `llimo index @pkg` завантажує пакет у `~/.llimo/kb/@/`
- [ ] Автовиявлення залежностей через `dependency_files`
- [ ] Self-healing: 2 спроби → fallback на іншу модель
- [ ] CSV-експорт для grep-дебагу
