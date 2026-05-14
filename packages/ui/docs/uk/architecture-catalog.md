# OLMUI: Універсальна Архітектура Каталогів та Фільтрів

> Цей документ описує єдиний майстер-план, який об'єднує архітектуру каталогів, гідрації, пагінації та глибоку систему фільтрації (на базі дослідження CRM/ERP) для всіх UI-адаптерів (Lit, React, CLI, Swift, Kotlin).

---

## 1. Дослідження: Фільтрація в існуючих CRM / ERP

Щоб правильно побудувати архітектуру, мИ проаналізували як працюють фільтри в:

- **Odoo:** Фільтри — це "Домени" (масиви умов `[('category', '=', 3)]`), а UI генерується автоматично через XML `Search View`.
- **ERPNext:** Метадані фільтрів (Standard Filters) автоматично генерують інпути над списком (DocType).
- **Strapi (Headless CMS):** Всі поля фільтрації автоматично мапляться на глибокі URL-параметри (`?filters[category][$eq]=Shirts`), що робить стан фільтра ідеально придатним для "шарінгу".

**Висновок для нашої архітектури:**
Фільтр не може бути просто "рядком пошуку" або масивом тегів. **Фільтр — це повноцінна Доменна Модель (`FilterModel`)**, поля якої мапляться на параметри URL, а інтерфейс для неї будується автоматично через універсальний `FormViewer`.

---

## 2. Філософія та Ієрархія

1. Джерелом є дані у документах.
2. Інформація це дані і їх алгоритм (схема `static Model.*` і використання `Model.run()`).
3. Результатом є трансформовані дані, які можна зберегти або передати.
4. Інтерфейс, один з багатьох, лише доступ до інформації у свій спосіб. Тому під кожен інтерфейс потрібно мати свій додаток, який запускає інформацію на пристрої (`CLIRunner`, `WebRunner`, `SwiftRunner`, `KotlinRunner`, та інші).
5. При використанні клієнт-серверної архітектури, адміністратор (користувач) має можливість налаштувати яка частина додатку є серверною частиною, а яка клієнстькою. Це важливо для захисту даних, швидкості і зручності використання, і швидкості розробки.

Згідно з парадигмою **One Logic — Many UI (OLMUI)**, усі механізми підвантаження індексів, фільтрації та вибору мають спільну ієрархію:

1. **`@nan0web/ui` (Ядро)**
   - Містить базові доменні абстракції: `CatalogModel` та `HydratedModel` (який відповідає за розпакування мініфікованих полів індексу `i -> image`).
   - Визначає єдині абстрактні контракти: "Що таке Індекс?", "Що таке Список Виділених Елементів?", "Що таке Модель Фільтра?".
   - Визначає спосіб тестування логіки фільтрів без залежності від UI.

2. **`@nan0web/ui-lit` (Lit Адаптер)**
   - Реалізує контракти ядра через веб-компоненти та контролери (`DocumentIndexController`, `SelectController`, `UrlFilterModelController`).
   - Надає базовий `<catalog-view>` компонент, який інші додатки можуть композитувати.

3. **`@nan0web/ui-react` (React Адаптер)**
   - Реалізує ті самі контракти через React Hooks (`useDocumentIndex`, `useSelect`, `useUrlFilterModel`).

4. **`@nan0web/ui-cli` (CLI Адаптер)**
   - Відтворює ці ж механізми у терміналі (навігація стрілочками, prompt-форми для фільтрації, множинний вибір пробілом).

5. **`@nan0web/ui-swift` (SwiftUI Адаптер)**
   - Реалізує контракти ядра для iOS/macOS через `@StateObject` контролери та декларативний SwiftUI.

6. **`@nan0web/ui-kotlin` (Jetpack Compose Адаптер)**
   - Реалізує контракти ядра для Android додатків через `remember*` хуки та Composable функції.

---

## 3. Базові Універсалії (Контракти)

### 3.1. Гідрація та Індекси (`Document Index`)

- **Підвантаження**: Індекс має підвантажуватися автоматично, коли ми заходимо в каталог.
- **Розпакування**: Вся логіка демініфікації (`document.$index.fields`) лежить на рівні моделі (наприклад, у `HydratedModel`), а не на рівні UI-фреймворку.

### 3.2. Список Вибору (`Select List` / `selectIds`)

- **Ідентифікація**: Ключ локального сховища для вибраних елементів має базуватись на URL (напр., `document.$catalog`), щоб уникнути колізій між вибором кредитів та вибором карток.
- **Дії**: Порівняння (`Compare`) — це лише одна з можливих операцій (diff) над масивом `selectIds`. Базовий концепт — це просто множинний вибір (`Select`).

### 3.3. Фільтрація як `FilterModel` та Проблема Множинних Каталогів

- Фільтр — це екземпляр класу `FilterModel` з описаною схемою (пошук, чекбокси, селекти).
- **Синхронізація з URL та Scoping (Простори імен)**: Якщо на одній сторінці є кілька каталогів (наприклад, "Кредитки" та "Депозити"), їхні фільтри повинні мати унікальний простір імен (scope) у URL. Замість загального `?search=Visa`, URL матиме вигляд `?cards[search]=Visa&deposits[currency]=UAH`. Контролер `UrlFilterModelController` приймає параметр `scope` для вирішення цієї проблеми.
- Модель містить метод `applyFilter(items)` для клієнтської фільтрації (якщо весь індекс завантажено).
- Модель має генератор `run()`, який може повертати інтенції (наприклад, для формування API-запиту).

### 3.4. Пагінація (`Pagination`): Client-side vs Server-side

Механізм пагінації (limit, offset) повинен підтримувати два режими роботи:

1. **Client-side (SSG/Static)**: Якщо індекс статичний і невеликий (наприклад, 500 карток), ми завантажуємо його весь. Тоді `FilterModel` фільтрує масив в пам'яті, а `PaginationController` просто відрізає потрібний шматок (`items.slice(offset, offset + limit)`).
2. **Server-side (API/Database)**: Якщо це мільйони рядків, `FilterModel` та `PaginationController` не фільтрують локальний масив. Натомість вони формують метадані запиту (query params, GraphQL, SQL). Контролер індексу надсилає цей запит на сервер і отримує вже відфільтровану сторінку з 20 елементів.

---

## 4. Приклади Імплементації (CatalogView)

### 4.1. Приклад для Lit (`@nan0web/ui-lit`)

```javascript
export class BaseCatalogView extends LitElement {
  // 1. Storage Key на базі URL
  // Примітка: Аргументи передаються функціями (getters), щоб контролер міг реактивно переоцінювати
  // їх при зміні властивостей компонента (наприклад, при переході на інший document).
  selectCtrl = new SelectController(this, () => this.document?.$catalog || this.document?.url)

  // 2. Індекс
  indexCtrl = new DocumentIndexController(
    this,
    () => this.db,
    () => this.document,
    ModelClass,
  )

  // 3. Модель Фільтра (URL-sync із заданим scope для уникнення колізій)
  filterCtrl = new UrlFilterModelController(this, FilterModelClass, { scope: 'cards' })

  // 4. Пагінація
  paginationCtrl = new PaginationController(this, { limit: 20 })

  render() {
    // Фільтр самостійно застосовує критерії
    let items = this.filterCtrl.model.applyFilter(this.indexCtrl.items)

    // Пагінація
    items = this.paginationCtrl.apply(items)

    return html`
      <catalog-layout>
        <!-- Рендеримо модель фільтра як універсальну форму -->
        <form-viewer
          .model=${this.filterCtrl.model}
          @change=${this.filterCtrl.update}
        ></form-viewer>

        <catalog-grid>
          ${items.map(
            (item) => html`
              <render-item
                .item=${item}
                ?selected=${this.selectCtrl.has(item.id)}
                @select=${() => this.selectCtrl.toggle(item.id)}
              ></render-item>
            `,
          )}
        </catalog-grid>

        <catalog-paginator .ctrl=${this.paginationCtrl}></catalog-paginator>
      </catalog-layout>
    `
  }
}
```

### 4.2. Приклад для React (`@nan0web/ui-react`)

```javascript
export function CatalogView({
  document,
  db,
  basePath,
  ModelClass,
  FilterModelClass,
  RenderItemComponent,
}) {
  const storageKey = `select_${document.$catalog || document.url}`
  const { selectIds, toggleSelect } = useSelect(storageKey)

  // Фільтр як модель зі scope
  const { filterModel, updateFilter } = useUrlFilterModel(FilterModelClass, { scope: 'cards' })

  // Client-side сценарій (індекс завантажується повністю)
  // Для Server-side тут би передавалися параметри filterModel та page/limit у hook
  const { items, isLoading } = useDocumentIndex(db, document, basePath, ModelClass)

  // Пагінація (Client-side)
  const { page, limit, setPage, pagedItems } = usePagination(filterModel.applyFilter(items), {
    defaultLimit: 20,
  })

  return (
    <CatalogLayout>
      {/* FormViewer відмальовує поля FilterModel */}
      <FormViewer model={filterModel} onChange={updateFilter} />

      <Grid>
        {pagedItems.map((item) => (
          <RenderItemComponent
            key={item.id}
            item={item}
            isSelected={selectIds.includes(item.id)}
            onSelect={() => toggleSelect(item.id)}
          />
        ))}
      </Grid>

      <Paginator current={page} onSelect={setPage} hasMore={pagedItems.length === limit} />
    </CatalogLayout>
  )
}
```

### 4.3. Приклад для CLI (`@nan0web/ui-cli`)

```javascript
export class CatalogPrompt extends Model {
  async *run({ db, document, ModelClass, FilterModelClass }) {
    const storageKey = `select_${document.$catalog || document.url}`
    const selectStore = new CliStorage(storageKey)
    const selectedIds = selectStore.get() || []

    yield progress('Завантаження індексу...')
    const index = await db.fetchIndex(document.$catalog)
    const items = index.map((raw) => new ModelClass(raw, { parent: document }))

    // Модель фільтра керує запитаннями
    const filterModel = new FilterModelClass()
    yield* filterModel.run()

    const filteredItems = filterModel.applyFilter(items)

    // Пагінація
    const limit = 20
    const pageItems = filteredItems.slice(0, limit)

    const options = pageItems.map((item) => ({
      label: item.title,
      value: item.id,
      selected: selectedIds.includes(item.id),
    }))

    if (filteredItems.length > limit) {
      options.push({ label: '...Завантажити ще (Next Page)', value: '$next_page' })
    }

    const newSelectedIds = yield ask('Виберіть елементи:', {
      multiple: true,
      options: options,
    })

    if (newSelectedIds.includes('$next_page')) {
      return result({ status: 'paginate', nextOffset: limit })
    }

    selectStore.set(newSelectedIds)
    yield show(`Виділено елементів: ${newSelectedIds.length}`)
  }
}
```

### 4.4. Приклад для Swift (`@nan0web/ui-swift`)

```swift
import SwiftUI

struct CatalogView<ModelClass: Model, FilterModelClass: FilterModel>: View {
    let document: Document
    let db: Database

    @StateObject private var selectCtrl: SelectController
    @StateObject private var indexCtrl: DocumentIndexController<ModelClass>
    @StateObject private var filterCtrl: UrlFilterModelController<FilterModelClass>
    @StateObject private var paginationCtrl: PaginationController

    init(document: Document, db: Database) {
        self.document = document
        self.db = db

        let storageKey = "select_\(document.$catalog ?? document.url)"
        _selectCtrl = StateObject(wrappedValue: SelectController(storageKey: storageKey))
        _indexCtrl = StateObject(wrappedValue: DocumentIndexController(db: db, document: document))
        _filterCtrl = StateObject(wrappedValue: UrlFilterModelController(scope: "cards"))
        _paginationCtrl = StateObject(wrappedValue: PaginationController(limit: 20))
    }

    var body: some View {
        let filteredItems = filterCtrl.model.applyFilter(items: indexCtrl.items)
        let pagedItems = paginationCtrl.apply(items: filteredItems)

        VStack {
            // Універсальний рендер форми для моделі фільтра
            FormViewer(model: filterCtrl.model, onChange: filterCtrl.update)

            ScrollView {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 150))]) {
                    ForEach(pagedItems, id: \.id) { item in
                        RenderItem(item: item,
                                   isSelected: selectCtrl.has(item.id),
                                   onSelect: { selectCtrl.toggle(item.id) })
                    }
                }

                Paginator(ctrl: paginationCtrl)
            }
        }
    }
}
```

### 4.5. Приклад для Kotlin (`@nan0web/ui-kotlin`)

```kotlin
import androidx.compose.runtime.*
import androidx.compose.foundation.lazy.grid.*

@Composable
fun <M : Model, F : FilterModel> CatalogView(
    document: Document,
    db: Database,
    modelClass: KClass<M>,
    filterModelClass: KClass<F>
) {
    val storageKey = "select_${document.`$catalog` ?: document.url}"
    val selectCtrl = rememberSelectController(storageKey)
    val indexCtrl = rememberDocumentIndex(db, document, modelClass)
    val filterCtrl = rememberUrlFilterModel(filterModelClass, scope = "cards")
    val paginationCtrl = rememberPaginationController(limit = 20)

    val items = indexCtrl.items.collectAsState().value
    val filteredItems = filterCtrl.model.applyFilter(items)
    val pagedItems = paginationCtrl.apply(filteredItems)

    Column {
        // Універсальний рендер форми для моделі фільтра
        FormViewer(
            model = filterCtrl.model,
            onChange = { filterCtrl.update(it) }
        )

        LazyVerticalGrid(
            columns = GridCells.Adaptive(minSize = 150.dp)
        ) {
            items(pagedItems) { item ->
                RenderItem(
                    item = item,
                    isSelected = selectCtrl.has(item.id),
                    onSelect = { selectCtrl.toggle(item.id) }
                )
            }

            item(span = { GridItemSpan(maxLineSpan) }) {
                Paginator(ctrl = paginationCtrl)
            }
        }
    }
}
```
