# 🔄 Версіонування (Versioning)

> Історія змін, можливість відкату та прозорий аудит кожної модифікації.

---

## Визначення

Версіонування забезпечує повну відстежуваність змін у документах. Кожна зміна проходить через стейджинг, перевірку та фіксацію, створюючи надійну історію.

## Як це працює

### 1. Staging → Commit → History

```
User Edit → stageDb (_staged/) → commitChanges() → mainDb → Git/Log
```

Користувач вносить зміни. Вони потрапляють у локальний стейдж (`_staged/`). Після перевірки — фіксуються в основній базі, а старий стан архівується.

### 2. Інтеграція з Git

Оскільки дані — звичайні файли на диску (DB-FS), вся потужність Git доступна "з коробки":

```bash
# Подивитися зміни
git diff data/

# Відкатити документ
git checkout HEAD -- data/presentation/01-latency.nan0

# Подивитися історію конкретного документа
git log --oneline data/presentation/01-latency.nan0
```

### 3. Структурне Версіонування (Releases)

```
releases/
  1/
    0/
      v1.0.0/
        task.md       # Опис завдання
        task.en.md    # English version
      v1.0.1/
        task.md
      v1.0.2/
        task.md
```

Кожен реліз містить опис задачі (`task.md`), що є контрактом на зміни.

## Приклади

### Фіксація змін через EditorModel

```js
const editor = new EditorModel({}, { db: fs })

// 1. Внести зміну
await editor.stageChange('docs/hello.md', '# Updated Content')

// 2. Зафіксувати
const result = await editor.commitChanges('Updated hello doc')
// { success: true, message: 'Committed 1 files: Updated hello doc' }
```

### Відкат через CLI

```bash
nan0-editor revert docs/hello.md --to=v1.0.1
```

## Аналоги

| Платформа | Версіонування | Глибина |
| :--- | :--- | :--- |
| **Google Docs** | Автоматичне | Обмежена історія |
| **GitHub** | Git (повне) | Необмежена |
| **Notion** | Сторінкові версії | 30 днів (Free) |
| **NaN•Web** | Git + DB-FS | Необмежена, структурована |
