# Release v1.1.0 — First NPM Publication

## 🎯 Місія

Перша публікація `@nan0web/editor` в NPM як стабільне чисте логічне ядро для всіх редакторів екосистеми nan•web.

## Scope

Валідація готовності пакету до першої публікації:

1. **Package Exports** — коректність `exports` map, `main`, `types`
2. **Core API** — EditorModel, ModalStack, PersistenceManager експортуються та працюють
3. **Type Declarations** — `.d.ts` файли генеруються та коректно відповідають API
4. **ProvenDoc** — README.md генерується з README.md.js і є актуальним
5. **Package Hygiene** — `.npmignore` виключає dev-файли (play/, docs/, tests, datasets)
6. **Peer Dependencies** — `@nan0web/db ^1.3.0` коректно вказаний
7. **Version Consistency** — package.json version = 1.1.0

## ✅ Acceptance Criteria (Definition of Done)

- [ ] Все що експортується з `src/core/index.js` — доступне з пакету
- [ ] EditorModel: створення, loadDocument, updateContent, switchMode, onChange
- [ ] ModalStack: push/pop/depth/current з обмеженням maxDepth
- [ ] PersistenceManager: конструктор з db, save, configure
- [ ] Type declarations існують для кожного модулю
- [ ] README.md актуальний (згенерований з README.md.js)
- [ ] `npm pack --dry-run` не включає play/, docs/, \*.test.js
- [ ] `peerDependencies` містить @nan0web/db
- [ ] Версія = 1.1.0

## 🏗 Architecture Audit

- [x] Індекси екосистеми прочитані (packages/index.md)
- [x] Аналоги: це єдиний editor-core пакет
- [x] Джерела даних: через @nan0web/db (абстрактний інтерфейс)
- [x] Не залежить від UI-фреймворка (Pure Logic Core)
