# @nan0web/ui-react-bootstrap

> 🇬🇧 [English](../../README.md)

Інтеграція Bootstrap для екосистеми Nan0web.
Поєднує декларативну логіку UI з потужністю React Bootstrap.

## Опис

Цей пакет надає набір рендерерів та компонентів, які відображають стандарт Nan0web UI на Bootstrap-класи та компоненти. Включає універсальний **OlmuiInspector** для візуальної кастомізації CSS Custom Properties в реальному часі.

## Встановлення

```bash
# pnpm (рекомендовано)
pnpm add @nan0web/ui-react-bootstrap

# npm
npm install @nan0web/ui-react-bootstrap

# yarn
yarn add @nan0web/ui-react-bootstrap
```

## Компоненти

### TreeView

Ієрархічна візуалізація даних зі стилізацією Bootstrap ListGroup.

### Autocomplete

Пошуковий випадаючий список з Bootstrap Form controls.

### Header

Багаторівневий навігаційний хедер на основі Bootstrap Navbar.
Підтримує 3-рівневу навігацію, перемикач мови, модальний пошук та випадаюче меню входу.
Всі візуальні властивості керуються CSS Custom Properties `--header-*`, визначеними у `Header.v2.scss`.

```jsx
import Header from './components/organisms/Header/Header'

;<Header nav={{ items: navData }} title="Мій додаток" $logo={false} />
```

### OlmuiInspector

Універсальний візуальний інспектор для редагування CSS Custom Properties в реальному часі.
Обгортає будь-який компонент та генерує панель керування на основі **StylesClass**-схеми (патерн Model as Schema).

**Можливості:**

- Автоматичне визначення типу контролу: `SizeControl`, `SelectControl`, `ColorAlphaPicker`, `SpacingControl`, `ShadowControl`, `BorderControl`
- Одночасна генерація CSS для Light/Dark тем через `<style>` блок
- Dark-only CSS змінні (без дублювання в `[data-bs-theme="dark"]`)
- Історія Undo (до 50 кроків) з повною синхронізацією контролів
- Inline Reset підтвердження (без нативних діалогів)
- Export модалка: копіювання CSS Variables або JSON state в буфер обміну
- `onUpdate` callback-проп для інтеграції із зовнішнім стейтом

```jsx
import { OlmuiInspector } from './play/components/OlmuiInspector'
import { HeaderStyles } from './components/organisms/Header/HeaderStyles'

;<OlmuiInspector StylesClass={HeaderStyles}>
  <Header nav={{ items }} title="Попередній перегляд" />
</OlmuiInspector>
```

#### StylesClass (Model as Schema)

Кожна статична властивість визначає CSS-змінну з метаданими:

```js
class HeaderStyles {
  static bg = {
    help: 'Фон хедера',
    alias: 'header-bg',
    default: '#ffffff',
    defaultDark: '#212529',
  }
  bg = HeaderStyles.bg.default

  static shadow = {
    control: 'shadow',
    help: 'Тінь хедера',
    alias: 'header-shadow',
    default: '0 2px 10px rgba(0,0,0,0.05)',
    defaultDark: '0 2px 15px rgba(0,0,0,0.5)',
  }
  shadow = HeaderStyles.shadow.default
}
```

Підтримувані метаполя: `help`, `alias`, `default`, `defaultDark`, `units`, `options`, `min`, `max`, `step`, `control`, `isColor`.

#### Експорт

Export модалка генерує готовий до використання CSS:

```css
:root {
  --header-bg: #ffffff;
  --header-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

[data-bs-theme='dark'] {
  --header-bg: #212529;
  --header-shadow: 0 2px 15px rgba(0, 0, 0, 0.5);
}
```

## Атоми

### Button

Декларативна кнопка, зіставлена з Bootstrap `<Button>` з підтримкою variant, size та іконок.

### Input

Обгортка Bootstrap Form.Control з label, допоміжним текстом та станами валідації.

### Typography

Семантичний рендер тексту (`<h1>`–`<h6>`, `<p>`, `<small>`) з утилітами типографіки Bootstrap.

## Молекули

### Card

Bootstrap Card компонент з header, body, footer слотами та підтримкою зображень.

### SortableList

Перетягуваний список з Bootstrap стилізацією.
Використовує хук `useSortableList()` з `@nan0web/ui-react` всередині.

```jsx
import { SortableList } from '@nan0web/ui-react-bootstrap'

;<SortableList
  items={models}
  renderItem={(item) => <span>{item.name}</span>}
  onReorder={setModels}
  persist="my_order"
/>
```

## Організми

### Modal

Обгортка Bootstrap Modal для декларативного управління діалогами.

### Footer

Адаптивний футер з багатоколонковим макетом та посиланнями соціальних мереж.

## Блоки макету

### Nav

Верхня навігаційна панель на основі AST-дерева `$nav`. Підтримує випадаючі списки та мобільний гамбургер.

### Sidebar

Деревоподібна бокова навігація для документації та багатосекційних макетів.

### Page

Структурний скелетний макет, який об'єднує `Nav`, `Sidebar` та основну область контенту.

### Callout

Блоки уваги (Warning, Info, Tip), зіставлені з Bootstrap `Alert` варіантами.

### Markdown

Чистий контейнер для рендерингу попередньо згенерованого HTML з Markdown-контенту.

### ThemeToggle

Перемикач теми День/Ніч, який перемикає атрибут `data-bs-theme`.

### LangSelect

Віджет вибору мови для зміни активної `$locale`.

### Search

Універсальний пошуковий віджет з модальним оверлеєм та результатами в реальному часі.

### Content / Description / Excerpt / Features / Files / Price / Accordion

Спеціалізовані блоки рендерингу для каталожних товарів, сторінок продуктів та структурованого контенту.
