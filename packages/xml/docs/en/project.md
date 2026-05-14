# @nan0web/xml — Architecture Documentation

> _"Every byte matters. Every line is proven."_ — ArchiTechnoMage

---

## 🧭 Phase 1: Philosophy & Abstraction (The Seed)

### Mission

`@nan0web/xml` is a trusted atom for bidirectional transformation between nan•style JS objects and XML. No DOM, no external dependencies, no unnecessary bytes.

### Philosophy

- **Minimalism is trust.** Every function is exhaustive and tested.
- **Test → Documentation → Knowledge.** Every `it()` in `README.md.js` is simultaneously a test, an example, and an LLM query.
- **Code without action is noise.** If the test fails — the package is dead.

### Abstraction

The package implements the `Transformer` contract from `@nan0web/transformer` (base class with `encode(data)` / `decode(str)` methods), extending it with XML specifics.

### Terminology

| Term          | Definition                                                        |
| ------------- | ----------------------------------------------------------------- |
| nan•object    | Lightweight JS object with conventions `$attr`, `#comment`, `?pi` |
| `$attr`       | XML tag attribute (key prefixed with `$`)                         |
| `#comment`    | XML comment `<!-- text -->`                                       |
| `?xml`        | Processing Instruction `<?xml ... ?>`                             |
| `defaultTags` | Tag mapping configuration, self-closing, CDATA                    |
| `$selfClosed` | Self-closing tag logic (`<br />`)                                 |
| `$cdataTags`  | Tags whose content is wrapped in `<![CDATA[...]]>`                |
| `$tagAttrs`   | CSS-selector notation mapping to attributes (`div.main#id`)       |

---

## 📐 Phase 2: Domain Modeling (Data-Driven Models)

### Module Architecture

| Module                           | Role                                                                    |
| -------------------------------- | ----------------------------------------------------------------------- |
| `Case`                           | String transformation between camel, kebab, snake, pascal, upper, lower |
| `escape(unsafe, ignore)`         | Escaping XML special characters (`&`, `<`, `>`, `"`, `'`)               |
| `nano2attrs(attrs, defaultTags)` | Serializing `$attr` object → XML attribute string                       |
| `nano2xml(data, options)`        | Converting nan•object/array → XML string                                |
| `XMLTags`                        | Tag mapping configuration and self-closing logic                        |
| `XMLTransformer`                 | OOP wrapper: `encode()` + `decode()` (extends `Transformer`)            |

### Data Sources

- Tag configuration via `XMLTags` (in-code, class instances)
- RSS/Atom feeds — primary use case for `decode()` (parsing external XML)

---

## 🛠 Phase 3: Logic Verification (CLI-First)

### Test Pipeline

| Script                  | What it verifies                         |
| ----------------------- | ---------------------------------------- |
| `npm test`              | Unit tests `src/**/*.test.js` (31 tests) |
| `npm run test:docs`     | ProvenDoc — tests from `README.md.js`    |
| `npm run test:coverage` | Code coverage (93.5%)                    |
| `npm run test:release`  | Release contract tests                   |
| `npm run play`          | CLI playground (`play/main.js`)          |

### Coverage

- Status: 🟢 98.8% (documentation) / 93.5% (code)
- All 31 tests pass

### CLI Playground

```bash
npm run play
```

Runs `play/main.js` for local XML transformation experiments.

---

## 🪐 Phase 4: Sovereign Workbench (Sandbox)

Currently the package has only a CLI playground (`play/main.js`). A full Sandbox with visual interface is not implemented at this phase.

**Documentation:**

- `README.md` — ProvenDoc (generated from `README.md.js`)
- `docs/uk/README.md` — Ukrainian translation

---

## 🎨 Phase 5: Theming & Interface

This phase is not implemented — the package is a pure library with no UI components. Styling is not needed.

---

## 🗺 Roadmap

### v1.1.0 — `decode()` (XML → nano)

- Implement `XMLTransformer.decode()` — reverse transformation XML → nan•object
- RegExp-based parser with zero external dependencies
- RSS/Atom feed support (`eaukraine.eu` pipeline)
- Round-trip verification: `encode(data) → xml → decode(xml) → data₂` ≈ `data`
- Documented in `REQUESTS.md`

### Future

- `@nan0web/rss` — RSS feed package (depends on `decode()`)
- Streaming XML parser for large files
- XSLT-like transformations via nan•templates

---

## 🏁 Checklist (Definition of Done)

- [x] Clear mission defined
- [x] Implements `Transformer` contract (Base App abstraction)
- [x] All modules described with typed API
- [x] CLI playground works
- [ ] `decode()` implemented
- [ ] Sandbox integrates documentation
- [ ] Code coverage ≥ 95%
