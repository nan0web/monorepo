# 🌐 Workflow: Translate Documentation (Strict AI-Assisted)

Цей воркфлоу визначає жорсткий сценарій локалізації документації NaN•Web через ШІ.

## 🏗️ Структура Маніфесту

Всі мови мають бути зареєстровані у:

- `/docs/_/langs.{nan0|yaml|md}`

Основний індекс документації:

- `/docs/index.{md|nan0|yaml}`

## 🛠️ Кроки перекладу

### 1. Аудит цілісності

Використовуй `ProvenDocsAuditor` для виявлення відсутніх локалізацій:

```bash
nan0ai inspect --auditor ProvenDocsAuditor --level warning
```

### 2. AI-Асистований Переклад (LLiMo/AI)

Переклад виконується **абзац за абзацом**, зберігаючи структуру та код.
Використовуй `nan0ai subagent` з чітким промптом:

```bash
nan0ai subagent "Translate src/docs/README.md.js to [target_lang] paragraph-by-paragraph.
Keep all code blocks untouched.
Source: docs/index.md (UK)
Target: docs/index.[lang].md"
```

### 3. Збереження результату

- Перекладені MD файли зберігаються за схемою: `/docs/[name].[lang].md`
- Системні метадані (якщо є) оновлюються у `/docs/_/langs.nan0`

### 4. Верифікація

Запусти аудитора повторно. Статус має бути **100% Green**.

---

## 🧠 Правила для ШІ (OpenRouter/LLiMo)

1. **Зберігай зміст**: Не змінюй технічні терміни, що є частиною API.
2. **Абзацний метод**: Перекладай кожен текстовий блок окремо, не переставляючи їх місцями.
3. **Code-Style**: Не додавай `;` та використовуй таби, якщо редагуєш `.md.js`.
