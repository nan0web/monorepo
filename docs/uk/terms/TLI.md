# TLI (Total Logic Isolation / Тотальна Ізоляція Логіки)

- **Визначення**: Повна ізоляція бізнес- та аплікаційної логіки від побічних ефектів середовища виконання (таких як пряме використання `node:fs` / `print`, витоки `console.log` або прямі записи у потоки `process.stdout`).
- **Правило ізоляції**: Моделі мають бути абсолютно чистими («герметичними») та взаємодіяти із зовнішнім світом *виключно* через агностичні OLMUI-інтенти (`yield show()`, `yield log()`, `yield ask()`, `yield agent()` або `return result()`). Сирі системні виклики виводу суворо заборонені й автоматично перевіряються.
- **Докладні воркфлоу**: Див. [self-audit-protocol.md](../../../packages/ui/docs/uk/workflows/self-audit-protocol.md)
- **Реалізація перевірки**: [IntentAuditor.js](../../../packages/ui/src/domain/app/IntentAuditor.js)