# Seed: CORE-8 — Adopt-Agent Models → extends Model (@nan0web/core)

> Піддиректорія: `@nan0web/ui/adopt-agent` · 3 доменні моделі
> Пріоритет: 🥉 №4 (залежить від рішення по @nan0web/ui)

## 1. Поточний стан

Три моделі в `adopt-agent/src/domain/`:

### Blueprint.js
```js
import { resolveAliases, resolveDefaults } from '@nan0web/types'

export class Blueprint {
  static _name = { help: 'Project/agent name', alias: 'name', default: 'new-agent' }
  // ...instance fields з ClassName.field.default...
  constructor(data = {}) {
    resolveDefaults(Blueprint, this)
    const resolvedData = resolveAliases(Blueprint, data)
    Object.assign(this, resolvedData)
    // Map _name → name
  }
}
```

### ReleasePlanner.js, EconomyCalculator.js
— аналогічний паттерн: `resolveDefaults` + `resolveAliases` напряму.

## 2. Цільовий стан

```js
import { Model } from '@nan0web/core'

export class Blueprint extends Model {
  static _name = {
    help: 'Project/agent name (Package Name)',
    alias: 'name',
    default: 'new-agent',
    validate: (val) => val?.length > 2 ? true : 'Name must be at least 3 characters long',
  }
  static description = { help: 'Short description', alias: 'desc', default: 'Zero-Hallucination Agent' }
  static version = { help: 'Version', alias: 'v', default: '1.0.0' }
  static strictness = { help: 'Strictness', default: 'zero-hallucination', options: ['zero-hallucination', 'flexible'] }

  // ❌ instance field initializers ВИДАЛЯЮТЬСЯ
  // constructor спрощується до:
  constructor(data = {}) {
    super(data)
    if (this._name !== undefined) {
      this.name = this._name
      delete this._name
    }
  }
}
```

## 3. Контрольний список

- [ ] Переконатися що `@nan0web/core` вже є в dependencies `@nan0web/ui`
- [ ] `Blueprint extends Model` — видалити instance fields + спростити constructor
- [ ] `ReleasePlanner extends Model` — аналогічно
- [ ] `EconomyCalculator extends Model` — аналогічно
- [ ] Прогнати `Blueprint.test.js` (16 тестів)
- [ ] Перевірити `_name → name` mapping (Blueprint speciality)

## 4. Особливості

### Blueprint._name → name mapping
Blueprint має антипаттерн: `static _name` де `_` уникає конфлікту з `Function.name`.
Model.constructor використовує `this.constructor` (а не `this.name`), тому конфлікту немає.
Але instance mapping `_name → name` потрібно зберегти у constructor.

### resolveDefaults порядок (Blueprint gotcha)
Blueprint зараз робить `resolveDefaults(Blueprint, this)` **ДО** Object.assign — тобто пише defaults у this, а потім переписує data зверху. Model робить це коректно (`resolveDefaults(Model, data)` → assign), тому порядок зміниться. Тести повинні це покрити.

## 5. Ризик циклічності: ✅ Безпечно

`adopt-agent` є піддиректорією `@nan0web/ui`, яка після міграції вже залежатиме від `@nan0web/core`.
