# @nan0web/release.app

> **Global PM-as-Code Release Dashboard and Monitoring Hub**  
> Централізована консоль моніторингу релізів, статусу Git-гілок та телеметрії спринтів у монорепозиторії.

---

## 🛰️ Можливості

- **Табличний CLI-статус:** Відображення номерів `#`, версій, гілок Git, стану незакомічених змін (`clean`/`dirty`), витраченого часу, кількості ітерацій, балу готовності RRS та прогресу задач.
- **Детальний Інспектор:** Перегляд повного паспорта окремого проєкту за номером або назвою (`nan0release status 8` або `nan0release status @industrialbank/bank`).
- **Сортування та Фільтри:** Швидке сортування за часом (`--sort=hours`), готовністю (`--sort=rrs`) або статусом (`--sort=state`).
- **Web Dashboard:** Генерація адаптивного HTML дашборду з клікабельними фільтрами, пошуком та відстеженням джерел даних (Provenance) у [play/index.html](./play/index.html).
- **Валідатор структури (`check`):** Перевірка цілісності релізів з чіткими інструкціями для виправлення як для розробника, так і для AI-агентів.

---

## 📦 Встановлення та Запуск

### У межах монорепозиторію:
```bash
# Перегляд таблиці статусів
pnpm run release:status

# Генерація Web Dashboard
pnpm run release:web

# Валідація структури релізів
pnpm run release:check
```

### Через глобальний бінарник `nan0release`:
```bash
# 1. Загальний огляд
nan0release status
nan0release check --all
nan0release web

# 2. Робота з конкретним проєктом (за номером # або назвою)
nan0release status 8
nan0release check 8
nan0release status @industrialbank/bank
nan0release check @industrialbank/bank
```

---

## 💡 IDE Autocomplete & Schema Validation (Antigravity & VS Code)

У монорепозиторії налаштовано автоматичну схему валідації та автодоповнення для YAML Frontmatter у `release.md`, `task.md` та `user.md`:

- **Схема:** [`.schemas/pmac-release.schema.json`](../../.schemas/pmac-release.schema.json)
- **Підключення:** [`.vscode/settings.json`](../../.vscode/settings.json) (`yaml.schemas`)
- **Підказки та валідація:** При створенні чи редагуванні frontmatter редактор (Antigravity або VS Code) автоматично підказує доступні поля (`version`, `status`, `hours`, `iterations`, `rrs`, `deadline`, `priority`, `models`) та валідує їхні типи і допустимі значення (`enum`).

---

## 📖 Документація

- [Методологія підрахунку метрик та телеметрії (Hours, Iterations, RRS)](./docs/telemetry.md)
- [Специфікація поточного релізу v0.1.0](./releases/0/1/v0.1.0/release.md)
- [План наступних кроків](./next.md)
