---
version: 3.4.2
type: patch
status: done
locale: uk
models: ["PayloadCmsApp"]
---

# 🛠️ Реліз v3.4.2 — Виправлення пакування `bin/app.js` (`src/plugins`)

## Мета
Усунути падіння бінарника `nan0cms` (`bin/app.js`) у зовнішніх проєктах з помилкою `ERR_MODULE_NOT_FOUND` для `src/plugins/withPayload.js`, додавши `src/plugins` до поля `"files"` у `package.json` та закріпивши контрактним тестом пакування.

## Задачі
- [x] Додати контрактні тести у `releases/3/4/v3.4.2/task.spec.js` та `src/test/PackageExports.spec.js` (TDD Red): перевірка всіх шляхів з `exports` та імпортів `bin/app.js` у `npm pack --dry-run --json` і запуск `node bin/app.js --help`.
- [x] Оновити `package.json`: додати `"src/plugins"` у `"files"`, оновити `"version"` до `"3.4.2"` та додати скрипт `"test:all"`.
- [x] Прогнати `pnpm --filter @nan0web/payload-cms.app run test:all`, `npm pack --dry-run` та `release:validate`.

## Target Files
- `apps/payload_cms.app/releases/3/4/v3.4.2/task.md`
- `apps/payload_cms.app/releases/3/4/v3.4.2/user.md`
- `apps/payload_cms.app/releases/3/4/v3.4.2/task.spec.js`
- `apps/payload_cms.app/src/test/PackageExports.spec.js`
- `apps/payload_cms.app/package.json`
