# Release v1.1.0 — XMLTransformer.decode()

## Scope

Імплементація `XMLTransformer.decode()` — зворотне перетворення XML-рядка у nano-стиль JS-об'єкт.
Це зворотна операція до `nano2xml()` / `XMLTransformer.encode()`.

## Requester

`eaukraine.eu` — News Parser Pipeline (RSS/Atom feed consumption)

## Acceptance Criteria (Definition of Done)

1. ✅ `decode('<tag>text</tag>')` → `{ tag: 'text' }`
2. ✅ `decode('<tag attr="val">text</tag>')` → `{ tag: 'text', $attr: 'val' }`
3. ✅ `decode('<br />')` → `{ br: true }`
4. ✅ `decode('<root><a>1</a><b>2</b></root>')` → `{ root: { a: '1', b: '2' } }`
5. ✅ `decode('<![CDATA[text]]>')` → raw text
6. ✅ `decode('<?xml version="1.0"?>')` → `{ '?xml': true, $version: '1.0' }`
7. ✅ RSS feed decode — масиви `<item>` у `<channel>` → `channel.item = [...]`
8. ✅ Round-trip: `encode(data) → xml → decode(xml) → encode(decoded)` = identity
9. ✅ XML entity unescaping: `&amp;` → `&`, `&lt;` → `<`, `&gt;` → `>`, `&quot;` → `"`, `&#039;` → `'`
10. ✅ Zero external dependencies (RegExp-based parser)

## Architecture Audit

- [x] Прочитано Індекси екосистеми
- [x] Аналогів `decode()` у пакетах немає
- [x] Джерела даних: XML (RSS/Atom feeds)
- [x] Не UI — бібліотечний код

## Implementation Notes

- `unescape()` function — inverse of existing `escape.js`
- `defaultTags` guides array detection: if `RSSTags.channel = 'item'`, multiple `<item>` → array
- Pure RegExp-based tokenizer, no DOM, no external deps
