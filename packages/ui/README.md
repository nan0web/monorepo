# @nan0web/ui

Легкий, агностичний UI-фреймворк, розроблений за філософією **nan0web** — одна логіка додатка, багато UI-реалізацій (One Logic — Many UI).

## Documentation / Документація

Оберіть мову документації:

- 🏴󠁧󠁢󠁥󠁮󠁧󠁿 [**English Documentation**](./docs/en/README.md)
- 🇺🇦 [**Українська документація**](./docs/uk/README.md)

---

## Quick Start / Швидкий старт

```bash
npm install @nan0web/ui
```

```js
import { Models } from '@nan0web/ui'
const { HeaderModel } = Models

const header = new HeaderModel({ title: 'My App' })
console.log(header.title)
```

## Resources / Ресурси

- 🏴󠁧󠁢󠁥󠁮󠁧󠁿 [Project Architecture (`project.md`)](./docs/en/project.md)
- 🇺🇦 [Архітектура проєкту (`project.md`)](./docs/uk/project.md)
- [Contributing](./CONTRIBUTING.md)
- [License (ISC)](./LICENSE)

---
© 2026 nan0web
