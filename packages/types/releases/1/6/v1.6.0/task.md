# Release v1.6.0 — VS Code Extension & Documentation

## Scope
- [x] **VS Code Extension**: Створити вбудоване розширення VS Code (`nan0-vscode`) як UI-адаптер у `src/ui/vscode/`.
- [x] **TextMate Grammar**: Підсвітка синтаксису NaN0 (ключі, значення, коментарі, масиви, дати, числа, boolean, null, multiline).
- [x] **Formatter**: Форматер документів через `NaN0.parse()` → `NaN0.stringify()` з round-trip збереженням коментарів.
- [x] **Build Pipeline**: esbuild збірка у єдиний CJS-бандл (`dist/extension.js`, 15.9 KB) з `vscode` як external.
- [x] **VSIX Packaging**: Команда `npm run package` створює `nan0-vscode-0.1.0.vsix` (9.39 KB) без зайвих файлів.
- [x] **NPM Isolation**: Папка `src/ui/vscode/**` виключена з NPM-публікації `@nan0web/types`.
- [x] **Documentation**: Table of Contents та секція "VS Code Extension" у `README.md.js`, `docs/uk/README.md`, extension `README.md`.

## Acceptance Criteria
- [ ] Папка `src/ui/vscode/` містить усі необхідні файли для повноцінного VS Code extension.
- [ ] `npm run build` (у `src/ui/vscode/`) генерує `dist/extension.js` без помилок.
- [ ] `npm run package` (у `src/ui/vscode/`) генерує `.vsix` без WARNING.
- [ ] Extension `package.json` має `"icon"`, `"repository"`, `"files"`, `"contributes"`.
- [ ] TextMate граматика покриває всі NaN0-типи: comment, key, number, date, boolean, null, string, multiline, empty collection, array item.
- [ ] Форматер (`provideDocumentFormattingEdits`) викликає `NaN0.parse` + `NaN0.stringify` і повертає `TextEdit`.
- [ ] `src/ui/vscode/**` НЕ потрапляє в NPM tarball `@nan0web/types`.
- [ ] `README.md` містить Table of Contents та секцію VS Code Extension.
- [ ] `docs/uk/README.md` містить секцію "Розширення VS Code".
- [ ] Усі існуючі тести проходять зелено (`npm run test:all`).

## Architecture Audit
- [x] Чи прочитано Індекси екосистеми? Так.
- [x] Чи існують аналоги в пакетах? Ні, це перше розширення для VS Code.
- [x] Джерела даних: NaN0 (.nan0, .n0 файли).
- [x] Чи відповідає UI-стандарту? Так, OLMUI — VS Code є UI-адаптером над ядром NaN0.
