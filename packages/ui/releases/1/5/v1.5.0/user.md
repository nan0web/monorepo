# v1.5.0 — Deep Linking & Light Theme Polish

**Status: Stable** (04.03.2026)

## Що нового

### 1. Deep-Linked Category URLs

Кожен компонент тепер має унікальний URL з категорією:

```
/uk/Actions/Button.html#var3
/uk/Feedback/Alert.html
/uk/Forms/Input.html
```

Категорії: `Actions`, `Forms`, `Data`, `Feedback`, `System`.

### 2. Активна сторінка при оновленні (F5)

Після натискання F5 компонент залишається підсвіченим у sidebar і секція автоматично розгортається.

### 3. Унікальні імена варіантів

Виправлено дублювання імені "Primary" у Button — тепер outline-кнопка називається "Outline" (за label).

### 4. Light Theme — блок коду

Code-блок (HTML/YAML tabs) тепер адаптивний до light theme: світлий фон `#f6f8fa`, читабельні таби.

## Відомі покращення (postponed → next.md)

- [ ] При збереженні нової варіації (`+ Save Variation`) — URL має оновлюватись як при кліку на неї
- [ ] Замінити `window.prompt()` на кастомний modal (Chrome мерехтить)
- [ ] CSS Variables Editor (`--co`, `--ba`, `--pa`, `--ma`) з reset/export
- [ ] Hotkey/URL для повного скидання налаштувань IDE
