# v1.1.0: Advanced Web E2E Snapshots & UI Localization

## Scope

1. **Full Page Screenshots**: E2E tests must capture the entire scrolled page, preventing incomplete document shots.
2. **Multi-Resolution matrix**: Testing across 5 specific viewport widths to ensure responsiveness:
   - **Mobile**: 370px, 768px (saved in `snapshots/play/web/mobile/`)
   - **Desktop**: 1024px, 1200px, 1920px (saved in `snapshots/play/web/desktop/`)
3. **Visual Gallery Generation**: E2E execution must automatically generate a `snapshot-play.md` document containing markdown image links to every generated screenshot.
4. **Web UI Localization**: The Web SSR server must react to `/uk/` (or other path-based selection) by localizing its standard navigation UI text (e.g. "Documents", "Theme", "YAML Data").
5. **Static Files Serving**: `play/web.js` must serve `.png` requests to allow `snapshot-play.md` to immediately display images in the Web UI.

## Acceptance Criteria

- [ ] `play.e2e.js` exists and defines resolutions `370`, `768`, `1024`, `1200`, `1920`.
- [ ] `play.e2e.js` executes `verifyScreenshot` with `fullPage: true`.
- [ ] `play/web.js` correctly serves localized UI components based on `data/_/t.yaml` and `.url`.
- [ ] `play/web.js` correctly returns `image/png` when `.png` files are requested.
- [ ] `snapshot-play.md` is created at the end of the test suite.

## Architecture Audit (Чекліст)

- [x] Чи прочитано Індекси екосистеми?
- [x] Чи існують аналоги в пакетах? (Частково @nan0web/play, але не для такого workflow)
- [x] Джерела даних: YAML, nano, md, json, csv? (YAML translations)
- [x] Чи відповідає UI-стандарту (Deep Linking)?
