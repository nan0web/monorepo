# 📰 CnAI News Collector

A lightweight, autonomous aggregator that collects latest Collective & Artificial Intelligence (CnAI) news from popular internet sources (HackerNews, Reddit, Twitter) without external API keys.

## Quick Start

```bash
# Fetch top 10 CnAI articles
node bin/nan0news

# Filter by keyword
node bin/nan0news --keyword "LLM" --limit 5

# With short flags
node bin/nan0news -k "agents" -n 10

# Show help
node bin/nan0news --help
```

## Architecture

Built on **OLMUI** (One Logic, Many UI) principle:
- **Domain Model** (`src/domain/NewsCollectorApp.js`) — Business logic
- **CLI Adapter** (`bin/nan0news` → bootstrapApp) — Terminal interface
- **Chat Adapter** (v0.5.0+) — CnAI Agent integration
- **Web Adapter** (v0.4.0+) — Browser UI

Each Model-as-Schema class in its own file:
- `NewsArticle.js` — Article model
- `NewsCollectorConfig.js` — Configuration model
- `NewsCollectorApp.js` — Main OLMUI application

## Model-as-Schema Pattern

All configuration self-describes via static properties:

```javascript
static keyword = {
  help: 'news.option.keyword.help',  // i18n key
  default: '',
}
```

This enables:
- Automatic CLI help generation
- Type checking
- Documentation generation
- i18n translations

## Testing

```bash
npm test              # Run all unit tests (describe/it format)
npm run test:all      # Full suite (build + lint + test)
```

Tests use `describe` and `it` from `node:test`:
- No external test frameworks
- Native Node.js test runner
- Mock i18n via options

## Development Phases

1. **v0.1.0** ✅ Mock data + domain model + CLI
2. **v0.2.0** 🔄 Real web scraping
3. **v0.3.0** 📅 Persistent cache
4. **v0.4.0** 📅 Web UI
5. **v0.5.0** 📅 Chat interface
6. **v0.6.0** 📅 Multi-language support

## File Structure

```
.
├── bin/
│   └── nan0news             # CLI entrypoint (bootstrapApp)
├── src/
│   └── domain/
│       ├── NewsCollectorApp.js       # Main OLMUI model
│       ├── NewsArticle.js            # Article model
│       ├── NewsCollectorConfig.js    # Config model
│       ├── NewsCollectorApp.test.js  # Tests (describe/it)
│       └── index.js                  # Exports
├── data/
│   └── _/
│       └── t.yaml                    # i18n translations
├── docs/
│   └── en/
│       ├── README.md                 # Full documentation
│       └── user-stories.md           # Acceptance criteria
├── package.json                      # prebuild + build
├── tsconfig.json                     # ignoreDeprecations
├── project.md                        # This file
└── seed.md                          # v0.1.0 seed (remove after release)
```

## Naming Conventions

- **bin command**: `nan0news` (no dash prefix)
- **prefix**: `nan0` (always lowercase, no dash)
- **terminology**: `CnAI` (Collective & Artificial Intelligence)
- **i18n keys**: `news.section.item` (dot notation)

## Build Scripts

```json
{
  "prebuild": "rm -rf types",  // Always clean first
  "build": "tsc"               // Then compile
}
```

Run: `npm run build` (executes prebuild first)

## Key Learning (Workflows)

✅ One Model-as-Schema class per file  
✅ Tests with `describe/it` from node:test  
✅ CLI via bootstrapApp (no src/ui/cli/index.js)  
✅ seed.md: NO user stories (they're in docs/en/user-stories.md)  
✅ i18n: All strings must have keys in data/_/t.yaml  
✅ Naming: nan0prefix (no dash), CnAI terminology  
✅ Build: prebuild → build scripts  
✅ TypeScript: ignoreDeprecations: "6.0"

See [docs/en/README.md](docs/en/README.md) for complete documentation.
