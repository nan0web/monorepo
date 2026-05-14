# Розширити exports в index.js

## 1. Контекст

Зараз `src/index.js` експортує тільки `AuthServer` і `User`.
Потрібно додати: `AuthDB`, `TokenManager`, `TokenRotationRegistry`, `AccessControl`.

## 2. Acceptance criteria (Definition of Done)

- [ ] З `index.js` можна імпортувати `AuthDB`
- [ ] З `index.js` можна імпортувати `TokenManager`
- [ ] З `index.js` можна імпортувати `TokenRotationRegistry`
- [ ] З `index.js` можна імпортувати `AccessControl`
- [ ] У `types/index.d.ts` додано відповідні експорти.

## 3. Architecture Audit

- [x] Чи прочитано Індекси екосистеми? (Пакет вже існує, знаємо контекст)
- [x] Чи існують аналоги в пакетах? (Ми додаємо існуючі класи в index.js)
- [x] Джерела даних: YAML, nano, md, json, csv? (Доступ через AuthDB)
- [x] Чи відповідає UI-стандарту (Deep Linking)? (Не застосовується)
