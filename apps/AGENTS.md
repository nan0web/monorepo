---
fractal: "apps"
layer: "L3"
locale: "uk"
parent: "../AGENTS.md"
intent: "Протокол додатків NaN•Web (ModelAsApp, CLI/Web/Chat адаптери) та межа ізоляції 3rdparty/*"
---

# 🚀 Додатки NaN•Web (`apps/*`, $L_3$)

> [!CRITICAL]
> **ОБОВ'ЯЗКОВИЙ СТАРТ СЕСІЇ (BEFORE ANY OTHER ACTION):**
> 1. **Мова:** Усі думки та відповіді користувачу — **ВИКЛЮЧНО українською мовою** (`locale: uk`).
> 2. **Перша дія:** Першим же викликом прочитай `read_file('../AGENTS.md')` (правила платформи `nan.web` $L_2$, `src` $L_1$, `7iOS` $L_0$).
> 3. **Без цього старту продовжувати роботу заборонено.**

## ⚡ Інваріанти Додатків ($L_3$)

1. Кожен суверенний додаток будується як композиція `ModelAsApp` (CLI / демони) та OLMUI-адаптерів (`ui-cli`, `ui-lit`, `ui-react`, `ui-chat`).
2. Збірка та запуск CLI відбуваються через `bootstrapApp(AppModel, options)` у `bin/*.js`.
3. **Межа суверенітету `3rdparty/`:** Директорія `./3rdparty/*` містить ізольовані зовнішні/комерційні проєкти, які **мають власні окремі Git-репозиторії**, НЕ наслідують цей файл і живуть за власними автономними `AGENTS.md`.

## 🧪 Протокол Перевірки Додатків ($L_3$)

- `pnpm --filter <app_name> run release:spec` — перевірка TDD-контракту поточного релізу.
- `pnpm --filter <app_name> run test:all` та `pnpm --filter <app_name> run release:validate` — повна прийомка.

## 🚫 ЗАБОРОНЕНО ($L_3$)

- Вбудовувати бізнес-логіку в `bin/*.js` (там дозволено лише ініціалізацію `bootstrapApp` та інжекцію портів).
- Імпортувати в `./3rdparty/*` правила вищих рівнів або порушувати їхню ізоляцію.

## 🗂 Лінивий Індекс Додатків (`apps/*`)

- **Системна Тріада:** [`./share.app/AGENTS.md`](./share.app/AGENTS.md) (`visnyk` — медіа-хаб та дистрибуція), `./mova.app` (`mova` — трансформація мови/аудіо), `./release.app` (`dilo` — PM-as-Code).
- **Платформні додатки:** `./nan0web.app`, `./llimo.app`, `./auth.app`, `./editor.app`, `./learn.app`, `./communication.app`, `./hosting.app`, `./payload_cms.app`.
- **Ізольований контур (окремі Git-репо):** `./3rdparty/*`.
