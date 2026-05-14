# v1.3.0 — SortableList Component

> 🇺🇦 [Українська версія](task.md)

> **Scope**: Headless Sortable List Component (OLMUI pattern)  
> **Date**: 2026-02-16  
> **Origin**: `@industrialbank/branches` — AI Chat model selector (v2.1.1)

## Mission

Create a headless `SortableList` component for reordering elements.
Pure data model + callbacks with no rendering dependencies.
Pattern — same as `Component/Welcome` and `Component/Process`.

## Scope of Changes

1. `src/Component/SortableList/SortableList.js` — headless data model
2. `src/Component/SortableList/index.js` — barrel export
3. `src/Component/index.js` — register SortableList
4. Version bump to `1.3.0`

## API

```js
import { SortableList } from '@nan0web/ui'

const list = SortableList.create({
  items: ['a', 'b', 'c'],
  onChange: (newOrder) => {},
})

list.moveUp(1) // swap index 1 ↔ 0
list.moveDown(0) // swap index 0 ↔ 1
list.moveTo(0, 2) // drag from position 0 to position 2 (drag-n-drop)
list.getItems() // current order
list.reset() // restore initial order
```

## Acceptance Criteria

- [ ] `SortableList.create()` returns a list instance
- [ ] `moveUp(i)` swaps item at index i with i-1
- [ ] `moveUp(0)` is a no-op (boundary)
- [ ] `moveDown(i)` swaps item at index i with i+1
- [ ] `moveDown(last)` is a no-op (boundary)
- [ ] `moveTo(from, to)` — drag-n-drop: removes item and inserts at new position
- [ ] `moveTo(i, i)` is a no-op
- [ ] `getItems()` returns current order
- [ ] `reset()` restores initial order
- [ ] `onChange` callback fires on every mutation
- [ ] Component exported from `@nan0web/ui` Component registry
- [ ] `package.json` version = `1.3.0`
