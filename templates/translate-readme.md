---
Мови: українська, англійська (оригінал)
---

- [](./packages/$pkgDir/README.md)
- [](./packages/$pkgDir/src/README.md.js)
- [](./packages/$pkgDir/docs/uk/README.md)

Переклади `README.md` > `docs/uk/README.md` і додай посилання на інші версії (en > uk), (uk > en) у `src/README.md.js`.

Додавай посилання зверху, щоб користувач який загубився зміг знайти свою мову.

Додавай лише посилання на ті мови, які надає користувач.

Якщо не надає, запитай про те, на які мови перекладати.

Приклад посилань у `README.md`

```md
This document is available in other languages:

- [Ukrainian 🇺🇦](./docs/uk/README.md)
- [Spanish 🇪🇸](./docs/es/README.md)
```

Приклад посилань у `docs/uk/README.md` (так само для кожного `docs/*/README.md`), обовʼязково додавай у кожен переклад:

```md
Цей документ доступний у інших мовах:

- [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](../../README.md)
- [Spanish 🇪🇸](../es/README.md)
```

Будь уважний до відносних посилань у перекладах: `./` => `../../`.
