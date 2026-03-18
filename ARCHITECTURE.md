# NaN•Web Architecture — Принципи

## 1. One Logic — Many UI

Єдина бізнес-логіка, множинні UI-реалізації:
`@nan0web/ui` (Lit), `@nan0web/ui-cli` (Terminal), `@nan0web/ui-react-bootstrap`.

Спільний контракт: моделі, валідація, i18n — незалежні від рендерера.

## 2. i18n: Тексти тільки з моделей

> **Всі написи UI визначаються виключно у моделях (`$Component` секція YAML) або в компонентах.**
> Ніякого hardcoded тексту у layout, IDE, scaffold, docs-site коді.

`@nan0web/i18n` автоматично збирає ключі з моделей — **єдине джерело правди**.

```
✅ Модель → i18n ключ → компонент рендерить
❌ Hardcoded строки в IDE / Sandbox / docs
```

### Пошукові теги ($search)

Кожна мова зберігає `$search` поле в YAML-моделі компоненту:

```yaml
$Button:
  $search: 'кнопка натиснути дія клік submit'
  label:
    default: Click Me
  variant:
    - primary
    - secondary
```

`$search` — це пошукові теги для IDE/Sandbox, щоб пошук працював будь-якою мовою.
Поля з префіксом `$` — мета-поля, вони **не потрапляють** у propTypes/defaultProps.

## 3. Моделі як Code

Компоненти описуються у YAML-файлах:

- `$ComponentName:` — схема пропів (масиви = enum, `.default` = значення)
- `content:` — варіанти (конкретні конфігурації)
- `$search:` — пошукові теги для IDE (per-lang)

Ці файли — авторитетне джерело для:

- Props Editor в IDE
- Snapshot тестів
- Документації
- Перекладів

## 4. URL як State

Кожен стан IDE має свій URL:

```
/{lang}/{Category}/{Component}.html#varN
```

Категорії, компонент, варіант — все у URL. F5 відновлює повний стан.
