# API Reference

The primary API boundaries are `EditorModel` and `ModalStack`.

## `EditorModel`

Manages the core document state and handles persistence.

- `mode`: `'code' | 'visual'`
- `content`: The live data.
- `loadDocument(uri)`: Fetches data via the provided `DB`.
- `updateContent(data)`: Applies new content locally.
- `save()`: Submits content back using the `PersistenceManager`.

## `ModalStack`

Manages a stack of nested documents/editors up to 7 levels deep, supporting breadcrumbs and sub-editing features.
