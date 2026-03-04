---
description: Генерація/оновлення сайту документації пакета згідно зі стандартом docs-site.md (i18n, Economy, CLI Sandbox)
---

# `docs-site` Workflow

> **Призначення:** Створення або оновлення живого сайту документації для пакета за стандартом `templates/docs-site.md`. Workflow визначає конкретний рівень документації, налаштовує i18n та інтеграцію з Economy.

## Крок 0: Підготовка

Прочитай стандарт документації:

```bash
cat ../../templates/docs-site.md
```

Визнач поточний рівень пакету:

- **Рівень 1** — Якщо відсутній `src/README.md.js` → створюємо ProvenDoc.
- **Рівень 2** — Якщо ProvenDoc є, але немає `docs/site/` → створюємо SSG сайт з i18n.
- **Рівень 3** — Якщо SSG сайт є, але немає навігації/Economy/пошуку → розширюємо до порталу.

## Крок 1: Рівень 1 — ProvenDoc (Обов'язковий)

Якщо `src/README.md.js` не існує, згенеруй його за шаблоном:

```bash
cat ../../templates/provendocs.md
```

// turbo
Запусти тести та генерацію:

```bash
pnpm test:docs
```

## Крок 2: Налаштування Багатомовності (i18n)

1. Переконайся, що існують переклади в `docs/uk/README.md`.
2. Якщо пакет має складний UI, створи словник `src/vocabs/uk.js` через `@nan0web/i18n`.
3. Додай перемикач мов (UK/EN) в майбутній Docs Site.

## Крок 3: Рівень 2 — Docs Site (SSG + Economy)

Створи структуру `docs/site/`:

```
docs/site/
├── index.html           # Entry point (ui-lit SSG з перемикачем мов)
├── pages/
│   ├── getting-started.md
│   ├── api.md           # Автогенерується з types/*.d.ts
│   ├── examples.md      # Живі приклади (Web або CLI через xterm.js)
│   └── economy.md       # Опис економіки теми та лінк на Store
└── sandbox/
    └── index.html       # Sandbox з кнопкою "Export to Theme Store"
```

### CLI Sandbox (якщо пакет — CLI-first)

Якщо пакет надає CLI інструменти, додай у документацію блок з терміналом:

```html
<nan0-cli-sandbox src="play/sandbox.js"></nan0-cli-sandbox>
```

Він має використовувати `xterm.js` для запуску пісочниці прямо в браузері.

### Economy Integration

Створи `docs/site/pages/economy.md`, де вкажи:

- Як налаштувати тему пакету.
- Як опублікувати свою тему в маркетплейс (комісія 18%).
- Посилання на глобальний `Theme Store`.

## Крок 4: Скрипти збирання

Додай у `package.json` скрипти:

```json
{
  "scripts": {
    "docs:build": "node scripts/build-docs.js",
    "docs:serve": "node scripts/serve-docs.js",
    "docs:translate": "llimo translate docs/site/pages --to uk"
  }
}
```

## Крок 5: Перевірка та Публікація

// turbo
Запусти збирання:

```bash
pnpm docs:build
```

Перевір, що:

1. Сайт працює англійською та українською.
2. Приклади (Web/CLI) інтерактивні.
3. Є кнопка експорту теми в Sandbox.
4. Всі чек-лісти з `templates/docs-site.md` виконані.
