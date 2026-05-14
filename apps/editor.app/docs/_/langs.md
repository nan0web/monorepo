---
- title: English (Canonical)
  locale: en
  strategy: source
- title: Українська
  locale: uk
  strategy: post-translation
---

# Documentation Languages

This project follows the **English-First** documentation protocol:
1. `README.md.js` generates the canonical English version in `docs/en/README.md`.
2. Localized versions (like `docs/uk/README.md`) are generated via the **Post-Translation** pipeline.
3. Manual edits should only be made to `src/docs/README.md.js`.
