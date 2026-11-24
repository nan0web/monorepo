# 🛠️ Виправлення хибних спрацювань DomainAuditor, IntentAuditor та SnapshotAuditor

> **Статус:** Planned / Backlog  
> **Пакет:** `@nan0web/inspect`  
> **Компоненти:** `JsDomainAuditor`, `JsIntentAuditor`, `SnapshotAuditor`  

---

## 🎯 Проблема та Причини

Під час аудиту `@nan0web/release` виявлено кілька системних невідповідностей у роботі інспекторів:

1. **`DomainAuditor` (порожні моделі без полів):**
   - Класи на кшталт `ReleaseApp extends ModelAsApp` мають лише `static alias`, `static UI`, `static command` (без власних полів схеми), але аудитор видає `Missing constructor in Model class`.
   - **Рішення:** Не вимагати `constructor(...)`, якщо в моделі не оголошено жодного статичного поля даних (окрім службових `UI`, `alias`, `$alias`, `command`).

2. **`IntentAuditor` (винятки для документації та специфікацій):**
   - `IntentAuditor` друкує `Hygiene Leak` (`console.info`) для `*.md.js` (ProvenDocs), `*.spec.js` та `*.story.js`, хоча в цих файлах консольний вивід є нормальним прикладом/демонстрацією.
   - **Рішення:** Зробити виняток для файлів `*.md.js` та `*.spec.js` безпосередньо в аудиторі гігієни намірів.

3. **`SnapshotAuditor` (ігнорування `optional`/`allowEmpty` з кореневого конфігу):**
   - Попри налаштування `snapshots: { optional: true, allowEmpty: true }` у кореневому `inspect.config.nan0`, `SnapshotAuditor` усе одно повертає `FAIL` (`No snapshots/ directory found`).
   - **Рішення:** Перевірити прокидання опцій `config.snapshots` / `config.modules.snapshots` у `SnapshotAuditor` та коректно повертати `ok: true`, коли `optional: true`.
