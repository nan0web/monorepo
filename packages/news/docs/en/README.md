# 📰 @nan0web/news — CnAI News Collector

> **Autonomous news aggregator** that collects latest Collective & Artificial Intelligence (CnAI) insights from popular internet sources without external API keys. Built on **OLMUI** architecture for seamless CLI, Chat, and Web integration.

**CnAI** = **Collective & Artificial Intelligence** — emphasizing that we work with LLMs, not sentient intelligence.

## Features

✨ **Zero API Keys** — Fetches from public sources (HackerNews, Reddit, Twitter)  
🎯 **Smart Filtering** — Filter by keyword (e.g., "LLM", "agents", "fine-tuning")  
📊 **Engagement Ranking** — Articles sorted by upvotes/retweets  
🚀 **OLMUI Compatible** — Single domain model, multiple UI adapters (CLI → Chat → Web)  
📦 **Lightweight** — No external databases or cloud dependencies  

## Installation

```bash
pnpm add @nan0web/news
```

## Quick Start

### CLI Usage

```bash
# Fetch top 10 CnAI articles
npx nan0news

# Filter by keyword
npx nan0news --keyword "LLM" --limit 5

# Short flags
npx nan0news -k "agents" -n 10

# Specific sources
npx nan0news --sources "HackerNews,Reddit"

# Show help
npx nan0news --help
```

### Programmatic Usage

```javascript
import { NewsCollectorApp } from '@nan0web/news'

const app = new NewsCollectorApp({
  keyword: 'agents',
  limit: 5,
  sources: ['HackerNews', 'Reddit'],
})

// Execute via generator (OLMUI pattern)
const gen = app.run()
let res = await gen.next()
while (!res.done) {
  // Process intents (status updates, prompts)
  res = await gen.next()
}

const result = res.value
console.log(result.data) // Structured output
```

## Architecture

Following **@nan0web** patterns:

```
src/
├── domain/                # Business logic (OLMUI model)
│   ├── NewsCollectorApp.js
│   ├── NewsArticle.js    # One file per Model-as-Schema class
│   ├── NewsCollectorConfig.js
│   └── NewsCollectorApp.test.js
├── ui/                   # (Future adapters for Chat, Web)
└── utils/                # (Future helpers)

data/
├── _/
│   └── t.yaml           # i18n translations & config
└── en/README.md         # Localized docs

docs/
├── en/
│   ├── README.md        # This file
│   └── user-stories.md  # Acceptance criteria

bin/
└── nan0news             # CLI entrypoint (bootstrapApp)
```

### Key Patterns

1. **Model-as-Schema** — `NewsArticle` and `NewsCollectorConfig` self-describe via static properties
2. **Generator-based Async** — `*run()` yields intents (status updates, prompts)
3. **Zero-Logic UI** — CLI is just argument parsing + calling domain model
4. **Data-Driven** — All configuration in YAML (`data/`)
5. **One File Per Class** — Each Model-as-Schema class in its own file

## Configuration

Environment variables (optional):

```bash
# Cache directory (default: system temp)
CACHE_DIR=/tmp/nan0news-cache

# Cache TTL in hours (default: 24)
CACHE_TTL=24
```

## Result Format

```json
{
  "ok": true,
  "code": 200,
  "data": [
    {
      "title": "Claude 3.5 Sonnet outperforms GPT-4",
      "source": "HackerNews",
      "url": "https://...",
      "score": 1250,
      "published": "2026-06-12T10:30:00Z",
      "keywords": ["LLM", "Claude", "benchmark"]
    }
  ],
  "metadata": {
    "total": 10,
    "sources": ["HackerNews", "Reddit"],
    "keyword": "LLM",
    "cached": true
  }
}
```

## Roadmap

- **v0.1.0** ✅ Mock data + domain model + CLI
- **v0.2.0** 🔄 Real scraping (replace mock data)
- **v0.3.0** 📅 Persistent cache (filesystem)
- **v0.4.0** 📅 Web UI adapter (React)
- **v0.5.0** 📅 Chat interface (CnAI Agent)
- **v0.6.0** 📅 Multi-language support
- **v1.0.0** 📅 Production release

## Testing

```bash
npm test                    # Run all tests
npm run test:coverage       # Coverage report
npm run test:all            # Full suite (includes build, lint)
```

## Development

```bash
npm run build               # Generate TypeScript types
npm run clean               # Clean build artifacts
```

## Model-as-Schema Reference

### `NewsArticle`

```javascript
static title = { help: 'news.article.title', default: '' }
static source = { help: 'news.article.source', default: 'HackerNews' }
static url = { help: 'news.article.url', default: '' }
static score = { help: 'news.article.score', default: 0 }
static published = { help: 'news.article.published', default: '...' }
static keywords = { help: 'news.article.keywords', default: [] }
```

### `NewsCollectorConfig`

```javascript
static keyword = { help: 'news.config.keyword.help', default: '' }
static limit = { help: 'news.config.limit.help', default: 10 }
static sources = { help: 'news.config.sources.help', default: [...] }
static cached = { help: 'news.config.cached.help', default: true }
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md)

## License

MIT — See [LICENSE](../../LICENSE)

---

**Built with ❤️ on the NaN•Web platform**

CnAI = Collective & Artificial Intelligence
