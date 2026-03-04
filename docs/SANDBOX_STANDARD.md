# Sandbox Standard (Playgrounds) v1.1.0

Цей стандарт визначає єдину структуру для демонстраційних та тестових сценаріїв (пісочниць) у межах платформи `nan•web`.

## 1. Структура директорії

Кожен пакет або додаток ПОВИНЕН мати директорію `play/` у своєму корені:

```text
project/
├── play/
│   ├── main.js             # CLI Entry (Node.js)
│   ├── index.html          # Web Entry (Vite)
│   ├── ios/                # Swift/SwiftUI Sandbox (Preview.swift)
│   ├── android/            # Kotlin/Compose Sandbox (Preview.kt)
│   ├── tauri/              # Desktop Sandbox (src-tauri/)
│   ├── bot/                # Telegram Bot Sandbox (main.js)
│   └── __snapshots__/      # Visual Regressions
├── src/
└── package.json
```

## 2. Команди та Фреймворки

### 🖥 CLI (Node.js)

Для CLI пісочниць ПОВИНЕН використовуватись `@nan0web/ui-cli`:

```javascript
// play/main.js
import { UniversalCLI } from '@nan0web/ui-cli'

const cli = new UniversalCLI({ title: 'Component Demo' })
cli.addCommand('demo', async () => {
  /* ... */
})
cli.start()
```

### 🌐 Web (Lit / React)

```bash
# package.json
"play": "vite --port 4246"
```

### 📱 Mobile (Native Previews)

Пісочниці для мобільних платформ мають бути автономними "прев'ю", що не потребують повної збірки додатку:

#### Swift (iOS)

```swift
// play/ios/SandboxView.swift
import SwiftUI
import NaN0Core // Адаптер логіки

struct SandboxView_Previews: PreviewProvider {
    static var previews: some View {
        EditorComponent(data: mockData)
            .environment(\.colorScheme, .dark)
    }
}
```

#### Kotlin (Android)

```kotlin
// play/android/SandboxPreview.kt
@Preview(showBackground = true)
@Composable
fun EditorPreview() {
    MaterialTheme(colors = darkColors()) {
        EditorComponent(uiModel = sampleModel)
    }
}
```

### 🏠 Desktop (Tauri)

- Використовуйте `play/tauri/` для запуску в ізольованому WebView з доступом до системного API.

## 3. Visual Review Protocol (Snapshot TDD)

Ми використовуємо "Систему Стікерів" для затвердження змін у UI:

1.  **Generation**: `npm run test:snapshot` створює нові скріншоти у `__snapshots__`.
2.  **Review**: `npm run gallery` створює `PLAY_GALLERY.md` — візуальну стрічку усіх станів.
3.  **Approval (Stickers)**:
    - **На рівні коду**: кожному затвердженому стану відповідає `$ok` мітка в метаданих (або мітках тесту).
    - **На рівні IDE**: VS Code extension надає кнопки `[Approve]` над скріншотами (через CodeLens).
4.  **Verification**: Реліз вважається стабільним ТІЛЬКИ якщо всі скріншоти мають стікер `$ok`.

## 4. Специфікація `ui-cli` інтеграції

Пісочниця має підтримувати ієрархічне меню:

```javascript
cli.addMenu('Components', (menu) => {
  menu.addCommand('Button', () => renderButton())
  menu.addCommand('Table', () => renderTable())
})
```
