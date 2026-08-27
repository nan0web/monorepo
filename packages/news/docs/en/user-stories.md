# User Stories & Acceptance Criteria

## Story 1: Collect Latest CnAI News

**As a** developer interested in CnAI trends  
**I want** to run a command that fetches latest CnAI news from popular sources  
**So that** I can stay updated without manually visiting multiple websites

### Acceptance Criteria

- ✅ Collects news from at least 3 sources (HackerNews, Reddit, Twitter)
- ✅ Returns top 10 trending topics by default
- ✅ Includes title, source, link, and engagement score
- ✅ Execution time < 5 seconds
- ✅ Works offline with cached data (24h cache)

### Implementation

- Mock data in v0.1.0
- Real scraping in v0.2.0
- See: `src/domain/NewsCollectorApp.js`

---

## Story 2: Filter by Keyword

**As a** busy user  
**I want** to filter results by keyword (e.g., "LLM", "agents", "fine-tuning")  
**So that** I only see relevant CnAI news

### Acceptance Criteria

- ✅ Supports `--keyword` flag (short: `-k`)
- ✅ Searches both title and keyword tags
- ✅ Returns results sorted by engagement (score)
- ✅ Case-insensitive matching
- ✅ Returns empty result if no matches (with message)

### Test Coverage

- `NewsCollectorApp.test.js`: `filters articles by keyword` test

---

## Story 3: No API Keys or Authentication

**As a** privacy-conscious developer  
**I want** to collect CnAI news without API keys or authentication  
**So that** I can use this tool anywhere, anytime

### Acceptance Criteria

- ✅ No external API calls required (mock data in v0.1.0)
- ✅ No environment variables for credentials
- ✅ Works offline with cached results
- ✅ 24-hour cache expiration
- ✅ Cache stored locally (filesystem, v0.2.0+)

### Implementation

- Cache directory: `${CACHE_DIR}/.nan0news-cache`
- TTL: 24 hours (configurable via `CACHE_TTL` env var)

---

## Story 4: Configurable Output

**As a** developer building integrations  
**I want** structured JSON output for programmatic use  
**So that** I can pipe results to other tools

### Acceptance Criteria

- ✅ CLI outputs JSON when called programmatically
- ✅ Includes metadata (total, sources, keyword, cached)
- ✅ Human-readable format for terminal output
- ✅ Exit code 0 on success, non-zero on error

### Example Output

```json
{
  "ok": true,
  "code": 200,
  "data": [
    {
      "title": "Claude beats GPT-4",
      "source": "HackerNews",
      "url": "...",
      "score": 1250,
      "published": "2026-06-12T10:30:00Z",
      "keywords": ["LLM", "Claude"]
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

---

## Story 5: Help & Usage

**As a** new user  
**I want** to see help and usage examples  
**So that** I can understand all available options

### Acceptance Criteria

- ✅ `--help` flag displays full documentation
- ✅ Shows all available options with descriptions
- ✅ Includes usage examples
- ✅ Shows default values
- ✅ Help generated from Model-as-Schema properties

### Implementation

- Automatic help generation in parent `ModelAsApp.generateHelp()`
- See: `@nan0web/ui` package

---

## Test Status

| Story | Test File | Status |
|-------|-----------|--------|
| 1 | `NewsCollectorApp.test.js` | ✅ Passing |
| 2 | `NewsCollectorApp.test.js` (filters) | ✅ Passing |
| 3 | `NewsCollectorApp.test.js` (cache) | ✅ v0.2.0 |
| 4 | `NewsCollectorApp.test.js` (result format) | ✅ Passing |
| 5 | `ModelAsApp.generateHelp()` | ✅ Passing |

---

## Development Roadmap

- **v0.1.0** ✅ Mock data + domain model + CLI + i18n
- **v0.2.0** 🔄 Real scraping (HackerNews, Reddit, Twitter)
- **v0.3.0** 📅 Persistent filesystem cache
- **v0.4.0** 📅 Web UI (React component)
- **v0.5.0** 📅 Chat interface (CnAI Agent integration)
- **v0.6.0** 📅 Multi-language support (uk, ru)
- **v1.0.0** 📅 Production ready

---

**Terminology Note**: CnAI = **Collective & Artificial Intelligence** — emphasizing that we work with LLMs (Language Learning Models), not sentient intelligence.
