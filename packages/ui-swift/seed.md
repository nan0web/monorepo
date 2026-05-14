# 🍏 NaN0Web Swift Adapter (ui-swift)

Цей пакет відповідає за нативне виконання JavaScript-генераторів (Model-as-Schema) в архітектурі **One Logic — Many UI (OLMUI)** на платформах Apple (iOS, macOS, visionOS) з використанням `JavaScriptCore` та `SwiftUI`.

## 🏗 Архітектурний Концепт

`ui-swift` — це універсальний контейнер-маршрутизатор (Adapter). Він:
1. Запускає JS-код додатку у нативному рушії `JavaScriptCore`.
2. Ловить усі асинхронні `yield` (Інтенції: `ask`, `progress`, `log`, `render`).
3. Конвертує їх із JS у Swift-словники (JSON-сумісний формат).
4. За допомогою **Фабрики Компонентів (Component Factory)** малює рідні `SwiftUI` елементи.
5. Відправляє відповіді (натискання кнопок, ввід тексту) назад в JS-генератор через міст (Bridge).

## 📂 Структура Swift Package Manager

```text
packages/ui-swift/
├── Package.swift                 <-- Маніфест SPM
└── Sources/
    └── nan0UI/
        ├── Bridge/
        │   └── IntentBridge.swift       <-- Завантажує JSCore, керує генераторами
        ├── Adapter/
        │   └── SwiftAdapter.swift       <-- Приймає JSON і конвертує в Model
        ├── Components/
        │   ├── BaseInputView.swift      <-- Нативне текстове поле
        │   ├── BottomSheetSelect.swift  <-- Нативний селект
        │   └── ProgressSpinnerView.swift
        └── Registry/
            └── ComponentFactory.swift   <-- Реєстр `type` -> `AnyView`
```

## 🧩 Інверсія Контролю (Inversion of Control)

Пакет `ui-swift` містить **ТІЛЬКИ** універсальні, незалежні компоненти (`Input`, `Select`, `Confirm`).
Якщо конкретний додаток (наприклад `apps/share.app`) потребує власного унікального SwiftUI-компонента, цей компонент **НЕ МАЄ** знаходитись у глобальному `ui-swift`.

Він розташовується безпосередньо в структурі додатка:
`apps/share.app/src/ui/swift/components/ShareView.swift`

### Приклад Реєстрації Кастомного Компонента

Коли розробник збирає iOS застосунок `ShareApp`, він підключає `ui-swift` як бібліотеку, та реєструє свій специфічний компонент у Фабриці (Plugin System):

```swift
import SwiftUI
import nan0UI // 📦 Наш базовий ui-swift пакет

@main
struct ShareIOSEntryApp: App {
    let runner: OlmuiRunner
    
    init() {
        // 1. Отримуємо фабрику
        let factory = ComponentFactory.default()
        
        // 2. Реєструємо специфічний для додатка компонент 
        // (лежить в apps/share.app/src/ui/swift/)
        factory.register(type: "share_widget") { intentData in
            AnyView( ShareView(schema: intentData) )
        }
        
        // 3. Запускаємо міст
        self.runner = OlmuiRunner(factory: factory, scriptRef: "shared_bundle.js")
    }

    var body: some Scene {
        WindowGroup {
            OlmuiShellView(runner: runner)
        }
    }
}
```

## 🔄 Життєвий Цикл (The Bridge Loop)

1. **JS:** `yield ask('name', new SelectModel(...))`
2. **Swift:** `IntentBridge` ловить подію `ask`. Читає поле `type`.
3. **Swift:** Викликає `ComponentFactory.build(intent)`.
4. **iOS:** На екрані малюється нативна `SwiftUI` форма (BottomSheet).
5. **Користувач:** Тицяє "Вибрати".
6. **Swift:** Відсилає `{ value: "laptop", cancelled: false }` у `IntentBridge`.
7. **JS:** Викликається `generator.next({ value: "laptop" })`.

### Навіщо це?
Тобі **ніколи** не доведеться дублювати бізнес-логіку або сценарії додатків у Swift. Swift та Kotlin існують виключно як "Візуальна Шкіра" (View), тоді як єдиний мозок (JS Домен та Intents) керує всіма програмами.
