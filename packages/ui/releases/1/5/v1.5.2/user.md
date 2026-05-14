# v1.5.2 — Зворотній зв'язок Архітектора

## Дата: 04.03.2026

### Зауваження 1: NaN0 Spec — bare values

NaN0 Spec виводив `$variant: "brand"` замість `$variant: brand`.
Значення мають бути bare (без лапок).

**Статус**: ✅ Виправлено

### Зауваження 2: label → content миграція (IndexedDB)

Кастомні варіації збережені в IndexedDB зі старим prop `label`. Після ренейму
у Properties panel з'являються ОБА: `label: Click Me` та `content: Бренд`.

**Причина**: `ui-button` web-компонент використовує `label` як свій property
(`static properties = { label: { type: String } }`). Тому `label` — це реальний
prop для DOM, але `content` — канонічний для NaN0 специфікації.

**Рішення**: НЕ перейменовувати `label` у YAML (бо це DOM prop). Повернути
`label:` у YAML конфіги. Натомість `_generateCode` YAML/NaN0 має мапити
`label` → `content` у виводі коду. У IDE properties panel `label` — ок.

**Статус**: 🔴 Потребує тесту та виправлення

### Зауваження 3: Code tabs styling

Таби Code Pane мають `border-radius: 0` і вирівняні по висоті.

**Статус**: 🔴 Потребує тесту та перевірки

### Зауваження 4: localStorage для codeFormat

Активна вкладка (HTML/YAML/NaN0) зберігається у localStorage.

**Статус**: ✅ Виправлено
