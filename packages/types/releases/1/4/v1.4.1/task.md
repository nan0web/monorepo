# Release v1.4.1 — NaN0 Schema-Aware & Comment Order Fix

## Scope
- [x] **Benchmarking**: Глибокий аналіз швидкості NaN0 (stringify/parse) проти JSON, YAML та MD на великих даних (~21kB).
- [x] **Schema-Aware Parsing**: Парсер тепер враховує `static type` та `static itemType` з моделей. Числа можуть парситись як стрінги за необхідності.
- [x] **Comment Order Fix**: Виправлено баг збору коментарів ("top-down push" замість "bottom-up reverse"). Порядок коментарів тепер завжди відповідає порядку ключів.
- [x] **Recursive Context**: Контекст моделі тепер коректно передається у вкладені об'єкти та елементи масивів.

## Acceptance Criteria
- [ ] Всі 52 тести у `src/domain/NaN0.test.js` проходять (PASS).
- [ ] Бенчмарк `node src/domain/NaN0.benchmark.js` показує перевагу NaN0 над YAML/MD.
- [ ] Коментарі для 3+ ключів збираються в правильному порядку.
- [ ] Поля з `type: String` ігнорують автоматичне перетворення в `Number`.

## Architecture Audit
- [x] Чи прочитано Індекси екосистеми? Так, `@nan0web/types` є фундаментом.
- [x] Чи існують аналоги в пакетах? Немає, це унікальна власна реалізація NaN0.
- [x] Джерела даних: NaN0, YAML, MD, JSON.
- [x] Чи відповідає UI-стандарту (Deep Linking)? Так, через підтримку `ModelError` та `TFunction`.
