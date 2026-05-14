# Місія релізу 0.2.2

Розширення `Playground` для відображення динамічних компонентів Bank Shell та Data YAML.

## Scope

- Підтримка `disableBaseRegistry` у `<Playground>` для приховування базових секцій OLMUI.
- Динамічний рендеринг компонентів з `extraComponents` та `components`.
- Підтримка `rawMeta` в `<Example>` для відображення сирого YAML тексту без форматування у JSON.

## Acceptance criteria

- [x] Підтримка `disableBaseRegistry={true}`
- [x] Динамічний мапінг `extraComponents` / `components`
- [x] Відображення Data YAML в `Example`
- [x] Чи прочитано Індекси екосистеми?
- [x] Чи існують аналоги в пакетах?
- [x] Джерела даних: YAML, nano, md, json, csv?
- [x] Чи відповідає UI-стандарту (Deep Linking)?
