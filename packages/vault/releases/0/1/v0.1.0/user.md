# v0.1.0: Криптографічне ядро та Zero Data-Loss сховище

## Огляд для Користувача

У релізі **v0.1.0** закладено первинне ядро `@nan0web/vault`:
1. Автономне симетричне шифрування (Argon2id/scrypt KDF + ChaCha20-Poly1305 / AES-256-GCM).
2. Захист від втрати даних: атомарне збереження через swap-файли у віртуальній базі даних та автоматичний Rolling Backup (до 5 попередніх версій).
3. Доменні сутності `VaultModel`, `SecretItemModel`, `VaultHeaderModel` побудовані на філософії Model-as-Schema.

## Метрики Виконання

- Статус: Завершено успішно (Release Sealed)
- Ітерація: 1
- Тести: Green (4/4 passed)
- TypeScript Typings: Сгенеровано (types/)
- Prettier: 100% Clean
- Інспектор: Domain/UI separation OK

