# Examples & CLI Sandbox

На цій сторінці ви можете протестувати команди `@nan0web/release` безпосередньо в браузері.

## 💻 Повноцінний CLI Sandbox

Нижче вбудований термінал xterm.js, який запускає `play/sandbox.js`.

<nan0-cli-sandbox src="../../play/sandbox.js"></nan0-cli-sandbox>

## 📖 Приклади з ProvenDoc

### Створення релізу

```js
const release = new Release({
  version: 'v1.0.0',
  createdAt: new Date(),
})
```

### Парсинг Markdown

```js
const doc = ReleaseDocument.from(markdownText)
console.log(doc.version) // v1.0.0
```

Ви можете відкрити будь-який приклад у пісочниці натиснувши кнопку "Open in Sandbox".
