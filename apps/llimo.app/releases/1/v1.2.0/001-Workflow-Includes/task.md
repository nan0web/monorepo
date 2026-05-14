# Реліз v1.2.0 - Workflow Orchestration & Commands

[English](./task.en.md) | **Українською**

## Місія релізу (Scope)

- **Команда @workflow**: Створено повноцінну команду `WorkflowCommand`, яка дозволяє моделі динамічно запитувати файли із директорії шаблонів (у конфігурації `.llimorc` -> `@workflow`), генеруючи чекліст формату `- [](@workflow/ім'я.md)`.
- **Чистота архітектури**: Видалено милиці `handleIncludes` та `extractIncludes`. Система більше не шукає директиву `!include` в тексті, а покладається на єдиний стандарт парсингу команд (OLMUI).
- **Security Validation для Workflow**: Додано проксі `@llimo` до дозволених у `SecurityGateModel.js`. Раніше кроки виду `- @llimo index` у `WorkflowModel` блокувалися на рівні перевірки безпеки з помилкою *Security Violation: Proxy tool not allowed: @llimo*.

## Acceptance Criteria
- [x] Чи прочитано Індекси екосистеми?
- [x] Чи існують аналоги в пакетах?
- [x] Усі існуючі тести проходять успішно (Regression Tests: `pass 295`)
- [x] Контракт `task.spec.js` перевіряє факт додання шаблонів і працездатність команди `@workflow`.
