# v1.3.0 — Компонент SortableList

> 🇬🇧 [English version](task.en.md)

> **Область**: Headless компонент сортованого списку (OLMUI патерн)  
> **Дата**: 2026-02-16  
> **Походження**: `@bank/branches` — селектор AI Chat моделей (v2.1.1)

## Місія

Створити headless `SortableList` компонент для впорядкування елементів.
Чиста модель даних + callbacks без залежності від рендерингу.
Патерн — як `Component/Welcome` та `Component/Process`.

## Область змін

1. `src/Component/SortableList/SortableList.js` — headless модель даних
2. `src/Component/SortableList/index.js` — barrel експорт
3. `src/Component/index.js` — реєстрація SortableList
4. Підняття версії до `1.3.0`

## API

```js
import { SortableList } from '@nan0web/ui'

const list = SortableList.create({
  items: ['a', 'b', 'c'],
  onChange: (newOrder) => {},
})

list.moveUp(1) // поміняти індекс 1 ↔ 0
list.moveDown(0) // поміняти індекс 0 ↔ 1
list.moveTo(0, 2) // перетягнути з позиції 0 на позицію 2 (drag-n-drop)
list.getItems() // поточний порядок
list.reset() // відновити початковий порядок
```

## Критерії прийняття

- [ ] `SortableList.create()` повертає екземпляр списку
- [ ] `moveUp(i)` міняє елемент на індексі i з i-1
- [ ] `moveUp(0)` — без дії (межа)
- [ ] `moveDown(i)` міняє елемент на індексі i з i+1
- [ ] `moveDown(last)` — без дії (межа)
- [ ] `moveTo(from, to)` — drag-n-drop: витягує та вставляє на нову позицію
- [ ] `moveTo(i, i)` — без дії
- [ ] `getItems()` повертає поточний порядок
- [ ] `reset()` відновлює початковий порядок
- [ ] `onChange` зворотній виклик спрацьовує при кожній мутації
- [ ] Компонент експортується з реєстру `@nan0web/ui`
- [ ] `package.json` версія = `1.3.0`
