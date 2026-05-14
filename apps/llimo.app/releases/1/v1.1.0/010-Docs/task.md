# Оновлення документації та автоматичний переклад

## Статус: ✅ Завершено

## Завдання
1. ✅ Перекласти файли з `docs/uk/` в `docs/en/` використовуючи LLiMo AI.
2. ✅ Створити `TranslateDocsModel` як Model-as-App (OLMUI Generator).
3. ✅ CLI утиліта `bin/llimo-translate.js` інтегрована з `runGenerator`.

## Архітектура (Model-as-App)
- `src/domain/TranslateDocsModel.js` — самоописова модель з `async *run()` генератором
- `bin/llimo-translate.js` — тонкий CLI wrapper через `runGenerator` + `CLiInputAdapter`
- Модель видає інтенції (`progress`, `log`, `result`) — адаптер їх відмальовує
- Модель НЕ знає про CLI — Total UI Blindness дотримано

## Тести
- `src/domain/TranslateDocsModel.test.js` — 10/10 контрактних тестів:
  - Model-as-Schema (5 статичних полів)
  - Constructor & Defaults (3 сценарії)
  - OLMUI Generator Contract (2 перевірки)
