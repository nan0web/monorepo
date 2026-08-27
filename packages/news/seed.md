# 📰 CnAI News Collector - Project Seed (v0.1.0)

## Mission

Create a lightweight, autonomous CnAI news aggregator that collects and ranks the latest Collective & Artificial Intelligence (CnAI) related news and discussions from popular internet sources (HackerNews, Reddit, Twitter, etc.) without external dependencies or API keys.

**Note on terminology**: CnAI = **Collective & Artificial Intelligence**. We use this term to emphasize that we're working with LLMs (Language Learning Models), not sentient intelligence. These systems reflect the collective knowledge of humanity, hence "Collective & Artificial".

## Technical Constraints

- **Zero API Keys**: Public scraping only (ethical compliance)
- **Standalone**: No external databases or cloud services
- **OLMUI**: ModelAsApp base class for CLI/Chat/Web compatibility
- **Data-Driven**: Configuration in YAML (data/)
- **Model-as-Schema**: Domain model with self-describing static properties
- **Generator-Based**: Async execution with intent yielding

## Deliverables (v0.1.0)

1. ✅ Domain models (NewsArticle, NewsCollectorConfig) - one file per class
2. ✅ NewsCollectorApp extending ModelAsApp
3. ✅ Unit tests (describe/it format from node:test)
4. ✅ Mock data (real scraping in v0.2.0)
5. ✅ Binary entrypoint via bootstrapApp
6. ✅ i18n keys for all UI strings
7. ✅ Package.json with prebuild/build scripts

## Out of Scope (v0.1.0)

- Real web scraping (v0.2.0)
- Persistent filesystem caching (v0.3.0)
- Web UI (v0.4.0)
- Chat interface (v0.5.0)
- Multi-language support (v0.6.0)

---

**User Stories & Acceptance Criteria**: See [docs/en/user-stories.md](docs/en/user-stories.md)

**Status**: Implementation phase (Remove this file after v0.1.0 completion)
