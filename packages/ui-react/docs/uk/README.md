# @nan0web/ui-react

> 🇺🇸 [English version](../../README.md)

React UI бібліотека без залежностей для екосистеми nan0web.
Не використовує `react-bootstrap` — чистий HTML + CSS змінні Bootstrap.

<!-- %PACKAGE_STATUS% -->

## Опис

React реалізація UI-стандарту Nan0web.
Надає високоінтерактивні компоненти з підтримкою тем, які розділяють ту ж саму базову логіку, що й CLI.

Основні можливості:

- **Нуль UI Залежностей** — Ніякого react-bootstrap. Чистий HTML + CSS токени Bootstrap.
- **Синтаксис крапкової нотації (Dot-Notation)** — `Alert.warning.lg` → `<Alert className="warning lg" />`.
- **Універсальні блоки** — Nav, Sidebar, Alert, Markdown, ThemeToggle, LangSelect.
- **Паттерн Doc Prop** — Компоненти приймають об'єкт `doc` для динамічного контенту на базі YAML.
- **Render-First Архітектура** — Потужний універсальний рушій рендерингу для Markdown, YAML та Моделей.
- **Сучасна Естетика** — Преміальний вигляд і відчуття з повною доступністю.

## Встановлення

Як встановити за допомогою npm?

```bash
npm install @nan0web/ui-react
```

Як встановити за допомогою pnpm?

```bash
pnpm add @nan0web/ui-react
```

Як встановити за допомогою yarn?

```bash
yarn add @nan0web/ui-react
```

## Playground (Пісочниця)

Як запустити пісочницю (playground)?

```bash
npm run play
```

## Універсальні блоки

Універсальні блоки — це високорівневі компоненти документації, які працюють у всіх UI-адаптерах.

### Alert

Як відрендерити блок Alert за допомогою Data-Driven Model?

```yaml
content:
  - Alert: 'Інформаційне повідомлення'
  - Alert.warning: 'Попередження'
  - Alert.danger.lg: 'Критична помилка'
  - Alert.success: 'Оперецію завершено'
```

Як відрендерити блок Alert за допомогою React-компонентів?

```jsx
import { Alert } from '@nan0web/ui-react/src/Blocks/index.js'

<Alert type="warning">Попередження</Alert>
<Alert className="danger lg">Через класи</Alert>
```

### Markdown

Як відрендерити Markdown контент за допомогою Data-Driven Model?

```yaml
content:
  - Markdown: "# Привіт Світ\n\nЦе **напівжирний** текст."
```

Як відрендерити Markdown контент за допомогою React-компонентів?

```jsx
import { Markdown } from '@nan0web/ui-react/src/Blocks/index.js'

;<Markdown content="# Привіт Світ" />
```

### Nav

Як відрендерити Nav за допомогою Data-Driven Model?

```yaml
$nav:
  brand: Мій Сайт
nav:
  - title: Головна
    href: /
```

Як відрендерити Nav за допомогою React-компонентів?

```jsx
import { Nav } from '@nan0web/ui-react/src/Blocks/index.js'

;<Nav doc={doc} />
```

### Sidebar

Як відрендерити Sidebar за допомогою Data-Driven Model?

```yaml
$sidebar:
  title: Документація
sidebar:
  - title: Початок роботи
    url: /guide
```

Як відрендерити Sidebar за допомогою React-компонентів?

```jsx
import { Sidebar } from '@nan0web/ui-react/src/Blocks/index.js'

;<Sidebar doc={doc} />
```

## Синтаксис крапкової нотації (Dot-Notation)

Рендерер Element підтримує крапкову нотацію для додавання CSS класів до компонентів.
Кожен сегмент після першої крапки стає CSS класом.

```yaml
content:
  - Alert.warning: 'Обережно!' # → <Alert className="warning" />
  - Alert.danger.lg: 'Помилка!' # → <Alert className="danger lg" />
  - Button.primary.rounded: 'Надіслати' # → <Button className="primary rounded" />
```

Компоненти можуть аналізувати `className` для вирішення семантичних варіантів (напр. Alert знаходить `warning` у className).

## Базові Рендерери

### Typography

Як відрендерити Typography за допомогою Data-Driven Model?

````js
/**
 * Використовуйте стандартні HTML теги в YAML для елементів типографії (`h1`-`h6`, `p`).
 *
 * ```yaml
 * content:
 *   - h1: "Вітальний заголовок"
 *   - p: "Це абзац."
 * ```
 */
````

Як відрендерити Typography за допомогою React-компонентів?

```jsx
import { Typography } from '@nan0web/ui-react/src/index.jsx'

;<Typography variant="h1">Вітальний заголовок</Typography>
```

### Button

Як відрендерити Button за допомогою Data-Driven Model?

````js
/**
 * Використання з великої літери `Button` відображає React-компонент, дозволяючи точкову нотацію для класів або явні пропи.
 *
 * ```yaml
 * content:
 *   - Button.primary.lg: "Почати"
 *   - Button: "Натисни мене"
 *     variant: success
 * ```
 */
````

Як відрендерити Button за допомогою React-компонентів?

```jsx
import { Button } from '@nan0web/ui-react/src/index.jsx'

;<Button variant="primary">Натисни мене</Button>
```

### Avatar

Як відрендерити Avatar за допомогою Data-Driven Model?

```yaml
content:
  - avatar:
      src: '/avatar.png'
      alt: 'Користувач'
```

Як відрендерити Avatar за допомогою React-компонентів?

```jsx
import { Avatar } from '@nan0web/ui-react/src/index.jsx'

;<Avatar src="/avatar.png" alt="Користувач" />
```

## Інтерактивні Поля Вводу

### Input

Як відрендерити Input за допомогою Data-Driven Model?

```yaml
content:
  - input:
      $value: 'Іван Франко'
      $placeholder: "Введіть ім'я..."
```

Як відрендерити Input за допомогою React-компонентів?

```jsx
import { Input } from '@nan0web/ui-react/src/index.jsx'

;<Input value="Іван Франко" placeholder="Введіть ім'я..." />
```

### Select

Як відрендерити Select за допомогою Data-Driven Model?

```yaml
content:
  - select:
      $options:
        - value: 'uah'
          label: 'UAH'
        - value: 'usd'
          label: 'USD'
```

Як відрендерити Select за допомогою React-компонентів?

```jsx
import { Select } from '@nan0web/ui-react/src/index.jsx'

const options = [{ value: 'uah', label: 'UAH' }, { value: 'usd', label: 'USD' }]
<Select options={options} />
```

### Checkbox

Як відрендерити Checkbox за допомогою Data-Driven Model?

```yaml
content:
  - checkbox:
      $checked: true
      $label: 'Прийняти умови'
```

Як відрендерити Checkbox за допомогою React-компонентів?

```jsx
import { Checkbox } from '@nan0web/ui-react/src/index.jsx'

;<Checkbox checked={true} label="Прийняти умови" />
```

### Radio

Як відрендерити Radio за допомогою Data-Driven Model?

```yaml
content:
  - radio:
      $name: 'theme'
      $label: 'Темна Тема'
      $checked: true
```

Як відрендерити Radio за допомогою React-компонентів?

```jsx
import { Radio } from '@nan0web/ui-react/src/index.jsx'

;<Radio name="theme" label="Темна Тема" checked={true} />
```

### TextArea

Як відрендерити TextArea за допомогою Data-Driven Model?

```yaml
content:
  - textarea:
      $placeholder: 'Введіть опис...'
      $rows: 5
```

Як відрендерити TextArea за допомогою React-компонентів?

```jsx
import { TextArea } from '@nan0web/ui-react/src/index.jsx'

;<TextArea placeholder="Введіть опис..." rows={5} />
```

## Просунуті Компоненти

### Card

Як відрендерити Card за допомогою Data-Driven Model?

```yaml
content:
  - Card:
      - img:
          src: '/card.jpg'
      - h3: 'Заголовок Картки'
      - p: 'Текст опису.'
```

Як відрендерити Card за допомогою React-компонентів?

```jsx
import { Card } from '@nan0web/ui-react/src/index.jsx'

;<Card>
  <img src="/card.jpg" />
  <h3>Заголовок Картки</h3>
  <p>Текст опису.</p>
</Card>
```

### Table

Як відрендерити Table за допомогою Data-Driven Model?

```yaml
content:
  - table:
      - tr:
          - td: 'Значення 1'
          - td: 'Значення 2'
```

Як відрендерити Table за допомогою React-компонентів?

```jsx
import { Table } from '@nan0web/ui-react/src/index.jsx'

;<Table>
  <tbody>
    <tr>
      <td>Значення 1</td>
    </tr>
  </tbody>
</Table>
```

### Modal Window (Модальне вікно)

Як відрендерити Modal за допомогою Data-Driven Model?

```yaml
content:
  - Modal:
      $triggerText: 'Відкрити Деталі'
      $content:
        h2: 'Контент модального вікна'
```

Як відрендерити Modal за допомогою React-компонентів?

```jsx
import { Modal } from '@nan0web/ui-react/src/index.jsx'

;<Modal triggerText="Відкрити Деталі">
  <h2>Контент модального вікна</h2>
</Modal>
```

### Form

Як відрендерити Form за допомогою Data-Driven Model?

```yaml
content:
  - id: 'example-form'
    form:
      - label: "Ім'я Користувача"
        input:
          $value: 'admin'
```

Як відрендерити Form за допомогою React-компонентів?

```jsx
import { Form } from '@nan0web/ui-react/src/index.jsx'

const config = {
  id: 'example-form',
  form: [
    { label: "Ім'я Користувача", input: { $value: 'admin' } }
  ]
}
<Form element={config} />
```

### TreeView

Як відрендерити TreeView за допомогою Data-Driven Model?

```yaml
content:
  - tree:
      - name: 'src'
        type: 'dir'
        children:
          - name: 'index.js'
            type: 'file'
```

Як відрендерити TreeView за допомогою React-компонентів?

```jsx
import { TreeView } from '@nan0web/ui-react/src/index.jsx'

const data = [
  { name: 'src', type: 'dir', children: [ { name: 'index.js', type: 'file' } ] }
]
<TreeView data={data} mode="file" />
```

### Autocomplete

Як відрендерити Autocomplete за допомогою Data-Driven Model?

```yaml
content:
  - autocomplete:
      $options: ['Яблуко', 'Банан', 'Черешня']
      $placeholder: 'Виберіть фрукт...'
```

Як відрендерити Autocomplete за допомогою React-компонентів?

```jsx
import { Autocomplete } from '@nan0web/ui-react/src/index.jsx'

;<Autocomplete options={['Яблуко', 'Банан', 'Черешня']} placeholder="Виберіть фрукт..." />
```

## Data-Driven UI

Основний архітектурний паттерн екосистеми.
Контент визначається в YAML/JSON файлах, а UI-компоненти автоматично його рендерять.

```yaml
# data/index.yaml
$content:
  - Content
content:
  - h1: 'Вітаємо'
  - Alert.success: 'Готово до роботи!'
  - Button.primary: 'Почати'
```

```jsx
import { UIReact } from '@nan0web/ui-react/src/index.jsx'

;<UIReact db={db} uri="index" />
```

## API

### `UIReact`

Компонент верхнього рівня, який завантажує документ, вирішує переклади та рендерить контент.

| Пропсу    | Тип       | За замовчуванням | Опис                               |
| --------- | --------- | ---------------- | ---------------------------------- |
| `db`      | `DB`      | —                | Екземпляр бази даних               |
| `uri`     | `string`  | `''`             | URI документу                      |
| `context` | `object`  | `{}`             | Додатковий контекст (додатки, дії) |
| `console` | `Console` | `window.console` | Екземпляр логера                   |

### `UIRoot`

Повна оболонка додатку (shell) з маршрутизацією, перемиканням тем та завантаженням документів.

### `renderers`

Мапа `Map<string, Component>` усіх доступних рендерерів:

| Ключ           | Компонент    | Опис                         |
| -------------- | ------------ | ---------------------------- |
| `typography`   | Typography   | Семантичний рендеринг тексту |
| `button`       | Button       | Інтерактивні кнопки          |
| `input`        | Input        | Текстові поля вводу          |
| `select`       | Select       | Випадаючі списки             |
| `checkbox`     | Checkbox     | Логічні перемикачі           |
| `radio`        | Radio        | Одиничний вибір              |
| `textarea`     | TextArea     | Багаторядковий текст         |
| `avatar`       | Avatar       | Зображення профілю           |
| `card`         | Card         | Контейнери контенту          |
| `table`        | Table        | Табличні дані                |
| `modal`        | Modal        | Вікна поверх контенту        |
| `form`         | Form         | Згенеровані по схемі форми   |
| `tree`         | TreeView     | Ієрархічні дані              |
| `autocomplete` | Autocomplete | Вибір із пошуком             |

### Універсальні блоки

| Блок          | Опис                                           |
| ------------- | ---------------------------------------------- |
| `Nav`         | Верхня навігаційна панель із пропом doc        |
| `Sidebar`     | Бічна навігація із пропом doc                  |
| `Alert`       | Семантичний блок виклику із крапковою нотацією |
| `Markdown`    | Рендеринг Markdown за допомогою `marked`       |
| `ThemeToggle` | Перемикач світлої/темної теми                  |
| `LangSelect`  | Селектор мови                                  |
| `CodeBlock`   | Блок коду з підсвіткою синтаксису              |
| `Page`        | Повний макет сторінки                          |

Усі вищезгадані рендерери покриті тестами `vitest` та автоматично рендеряться через дані YAML.

## Внесок

Як зробити внесок? - [читайте тут](../../CONTRIBUTING.md)

## Ліцензія

Яка ліцензія? - Файл [ISC LICENSE](./LICENSE).
