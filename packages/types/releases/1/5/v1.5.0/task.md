# Release v1.5.0 — Single-pass Scanner (Performance Optimization)

## Scope
- [x] **Architecture**: Перейти від використання `split('\n')` до потокового (single-pass) читання символів у `Parser.js`.
- [x] **Memory Optimization**: Зменшити алокацію пам'яті (Node objects, strings) під час роботи парсера.
- [ ] **RegExp Cache**: Оптимізувати `numberRegex` та `dateRegex` у `NaN0.js` (зменшити кількість викликів).
- [ ] Створити `task.spec.js`, який контролюватиме, щоб парсер більше не використовував `split('\n')` для лінійного розбиття.

## Acceptance Criteria
- [ ] Метод `Parser.prototype.decode` переписаний на потоковий алгоритм (без `split`).
- [ ] AST-дерево генерується коректно (всі 276 регресійних тестів `test:all` проходять зелено).
- [ ] Швидкість парсингу NaN0 збільшується (бенчмарк).

## Architecture Audit
- [x] Чи прочитано Індекси екосистеми? Так.
- [x] Чи існують аналоги в пакетах? Це рефакторинг існуючого коду.
- [x] Джерела даних: NaN0, Markdown.
- [x] Чи відповідає UI-стандарту (Deep Linking)? Не застосовно до парсера.
