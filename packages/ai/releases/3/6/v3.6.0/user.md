# User Feedback — Реліз v3.6.0

## Виявлені архітектурні помилки в першій реалізації

1. **Прив'язка до `process` та `os.homedir()` у доменній моделі (`EditorDetector.js`):**
   - **Помилка:** Використання `getHomedir()`, `process.env.HOME`, `process.env.APPDATA`, `process.platform === 'win32'` безпосередньо всередині `EditorDetector.js`. Доменна модель має бути повністю агностичною до середовища виконання (Node.js / браузер / тести).
   - **Правильне рішення:** Визначення ОС (`darwin`/`linux`/`win32`) та реальних шляхів має відбуватися виключно на рівні bootstrap (`packages/ai/bin/nan0ai.js`), який монтує віртуальні точки в `DB`: `@gemini`, `@gemini-local`, `@cursor`, `@cursor-local`, `@vscode`, `@vscode-local`, `@claude`. Домен працює лише з цими маунтами через `this.$db`.

2. **Зайвий пошук монорепозиторію у `packages/ai/bin/nan0ai.js`:**
   - **Помилка:** Залишено ручний пошук `pnpm-workspace.yaml` / `lerna.json` та збереження `context.nan0`.
   - **Правильне рішення:** Прибрати пошук монорепозиторію та `context.nan0`, залишити чистий `bootstrapApp(AiAppModel, { db, appName: 'nan0ai' })` із змонтованими точками для редакторів.

3. **Плутанина з `~/` та `@app`:**
   - `~/` у `@nan0web/ui-cli` (`bootstrapApp`) веде до системної директорії додатка (`~/.nan0web`), а не до кореня користувача для редакторів. Тому для редакторів потрібні окремі маунти (`@gemini`, `@cursor`, `@vscode`, `@claude`, `@*-local`), реалізовані саме в `@nan0web/ai`.
   - Джерело скілів/правил має бути самодостатнім у пакеті `@nan0web/ai`, без прив'язки до зовнішнього workspace.
