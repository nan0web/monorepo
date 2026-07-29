---
description: Zero-Hallucination Subagent Protocol (Agnostic AI API)
---

# 🕵️ Subagent Protocol (Zero-Hallucination API)

Цей workflow визначає правила створення та взаємодії із вузькоспеціалізованими **Субагентами** (Subagents) всередині екосистеми NaN0Web. Головна мета — подолання "контекстної сліпоти" великих моделей шляхом мікророзподілу завдань, а також створення універсальних, платформонезалежних (Agnostic) AI API, які можна викликати з будь-якого середовища (Antigravity, Cursor, CI/CD, Node.js клієнт чи звичайний HTTP).

Згідно з резолюцією **Ради Мудреців** (фільтрація 4 законами логіки), субагент є суворо ізольованою, безстанційною функцією (stateless function), яка є "ультразвуковим дефектоскопом" для коду чи даних.

## 1. Архітектура Субагента (The Agnostic Blueprint)

Субагент не є "співрозмовником". Він — строгий механізм. Його контракт описується у вигляді Markdown або JSON інструкції, яка ідеально вміщується у `System Prompt`.

### Обов'язкові Вхідні Параметри (Input Payload):

- **Пайлоад має бути мінімалістичним і строго визначеним.** Жодних зайвих файлів або історії діалогів.
- Для валідації UI (`snapshot-audit`), пайлоад складається з:
  1. `[SPEC_LINK] / [RULES]`: Посилання на специфікацію або набір правил.
  2. `[LOCALE] / [CONTEXT]`: Мова або вузький контекст (`uk`, `en`, `theme`).
  3. `[TARGET_CONTENT]`: Сирий вміст файлу або зліпка (`.snap`, `.webp`, `.js`).

### Формат Спілкування (Persona & Execution):

Системний промпт субагента має бути агресивним на відсікання галюцинацій:

> "You are an isolated Zero-Hallucination UI Validator. You compute logical facts. You do not code. You do not talk. Your only objective is to compare `[TARGET]` against `[RULES]` in context of `[LOCALE]`.
> Any missing translations (e.g. English labels in `uk` locale), technical leakage (`NaN`, `[object Object]`, `undefined`), or structure mismatches are CRITICAL errors."

## 2. Суворі Обмеження Виводу (Output Contract)

Згідно з законом достатньої підстави та законом виключеного третього, субагент повертає лише строгий JSON, за яким машина може прийняти детерміноване рішення (Pass/Fail).

```json
{
  "score": 85,
  "errors": [
    "Line 12: Untranslated literal 'Create New Variant' strictly violates 'uk' locale rule.",
    "Line 15: Critical artifact '[object Object]' found inside rendering block."
  ]
}
```

- **`score` (0-100)**: Точна метрика відповідності. Тільки `100` означає успіх (Green).
- **`errors`**: Обов'язкове підкріплення помилок (Sufficient Reason) із конкретними номерами рядків або ключами.
- **Відсутність тексту**: Відповідь, що містить відформатований текст поза межами `{"score", "errors"}` (на кшталт "Here is your validation..."), вважається поламаним контрактом.
- **Кешування**: Результати успішних відповідей автоматично кешуються у `.agent/cache/subagents` на основі SHA-256 хешу промпту і вхідного файлу (`target`). Використовуйте `force: true` або `--force`, щоб обійти кеш. Кешування працює лише для субагентів, якщо `target` є шляхом до файлу, або пакетом файлів. Виклик через паралельні процеси використовує одну базу кешу, запобігаючи повторним дорогим запитом до LLM (зберігає ресурси і час як AI, так і розробника).

## 3. Сфери застосування (Універсальні Мікроагенти)

Відповідно до цієї матриці, необхідно створювати таких універсальних субагентів:

- `inspect-snapshot.md` — жорсткий перевіряльник `.snap` артефактів.
- `inspect-i18n.md` — перевірка ключів локалізації (чи немає hardcoded тексту у JSX).
- `prop-welder.md` — перевірка Контракту Зварювання (чи всі `exports` покриті тестами).
- `git-reviewer.md` — ізольована оцінка якості комміту на відповідність `project.md`.

## 4. Виклик (Agnostic Invocation)

Усі субагенти можуть і повинні працювати як на рівні Antigravity, так і на рівні CLI скриптів:

- **CLI / CI**: `subagent inspect-snapshot --target=snapshots/play/cli/uk/basic.snap --locale=uk`
- **Antigravity**: У робочому діалозі агент створює `subagent_payload.json` у `tmp/` і паралельно запускає дочірній процес чи запит через універсальне AI API для отримання результату, множачи продуктивність (Паралельне виконання від Івана Сірка).
