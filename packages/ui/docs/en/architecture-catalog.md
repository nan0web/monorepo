# OLMUI: Universal Catalog & Filter Architecture

> This document describes a unified master plan that combines catalog architecture, hydration, pagination, and a deep filtering system (based on CRM/ERP research) for all UI adapters (Lit, React, CLI, Swift, Kotlin).

---

## 1. Research: Filtering in existing CRM / ERP systems

To build the architecture correctly, wE analyzed how filters work in:

- **Odoo:** Filters are "Domains" (arrays of conditions `[('category', '=', 3)]`), and the UI is generated automatically via XML `Search View`.
- **ERPNext:** Filter metadata (Standard Filters) automatically generates inputs above the list (DocType).
- **Strapi (Headless CMS):** All filtering fields are automatically mapped to deep URL parameters (`?filters[category][$eq]=Shirts`), making the filter state perfectly suitable for "sharing".

**Conclusion for our architecture:**
A filter cannot be just a "search string" or an array of tags. **A filter is a full-fledged Domain Model (`FilterModel`)**, whose fields are mapped to URL parameters, and the interface for it is built automatically through the universal `FormViewer`.

---

## 2. Philosophy and Hierarchy

1. Data in documents is the source.
2. Information is the data and its algorithm (the `static Model.*` schema and the use of `Model.run()`).
3. The result is transformed data that can be saved or transmitted.
4. The interface, one of many, is only access to information in its own way. Therefore, each interface needs its own application that runs the information on the device (`CLIRunner`, `WebRunner`, `SwiftRunner`, `KotlinRunner`, and others).
5. When using client-server architecture, the administrator (user) has the ability to configure which part of the application is the server side and which is the client side. This is important for data protection, speed and ease of use, and speed of development.

According to the **One Logic — Many UI (OLMUI)** paradigm, all index loading, filtering, and selection mechanisms share a common hierarchy:

1. **`@nan0web/ui` (Core)**
   - Contains basic domain abstractions: `CatalogModel` and `HydratedModel` (responsible for unpacking minified index fields `i -> image`).
   - Defines unified abstract contracts: "What is an Index?", "What is a Selection List?", "What is a Filter Model?".
   - Defines a way to test filter logic without UI dependency.

2. **`@nan0web/ui-lit` (Lit Adapter)**
   - Implements core contracts through web components and controllers (`DocumentIndexController`, `SelectController`, `UrlFilterModelController`).
   - Provides a basic `<catalog-view>` component that other apps can compose.

3. **`@nan0web/ui-react` (React Adapter)**
   - Implements the same contracts through React Hooks (`useDocumentIndex`, `useSelect`, `useUrlFilterModel`).

4. **`@nan0web/ui-cli` (CLI Adapter)**
   - Reproduces these same mechanisms in the terminal (arrow navigation, prompt forms for filtering, multiple choice with spacebar).

5. **`@nan0web/ui-swift` (SwiftUI Adapter)**
   - Implements core contracts for iOS/macOS via `@StateObject` controllers and declarative SwiftUI.

6. **`@nan0web/ui-kotlin` (Jetpack Compose Adapter)**
   - Implements core contracts for Android apps via `remember*` hooks and Composable functions.

---

## 3. Basic Universals (Contracts)

### 3.1. Hydration and Indexes (`Document Index`)

- **Loading**: The index should load automatically when we enter the catalog.
- **Unpacking**: All deminification logic (`document.$index.fields`) resides at the model level (e.g., in `HydratedModel`), not at the UI framework level.

### 3.2. Selection List (`Select List` / `selectIds`)

- **Identification**: The local storage key for selected items should be based on the URL (e.g., `document.$catalog`) to avoid collisions between credit selection and card selection.
- **Actions**: Comparison (`Compare`) is just one of the possible operations (diff) over the `selectIds` array. The basic concept is simply multiple selection (`Select`).

### 3.3. Filtering as `FilterModel` and the Multiple Catalogs Problem

- A filter is an instance of the `FilterModel` class with a described schema (search, checkboxes, selects).
- **URL Sync and Scoping**: If there are multiple catalogs on one page (e.g., "Cards" and "Deposits"), their filters must have a unique namespace (scope) in the URL. Instead of a generic `?search=Visa`, the URL will look like `?cards[search]=Visa&deposits[currency]=UAH`. The `UrlFilterModelController` takes a `scope` parameter to solve this problem.
- The model contains an `applyFilter(items)` method for client-side filtering (if the entire index is loaded).
- The model has a `run()` generator that can return intentions (e.g., for forming an API request).

### 3.4. Pagination: Client-side vs Server-side

The pagination mechanism (limit, offset) should support two modes of operation:

1. **Client-side (SSG/Static)**: If the index is static and small (e.g., 500 cards), we load it all. Then `FilterModel` filters the array in memory, and `PaginationController` simply cuts off the needed slice (`items.slice(offset, offset + limit)`).
2. **Server-side (API/Database)**: If there are millions of rows, `FilterModel` and `PaginationController` do not filter the local array. Instead, they form the request metadata (query params, GraphQL, SQL). The index controller sends this request to the server and receives an already filtered page of 20 elements.

---

## 4. Implementation Examples (CatalogView)

### 4.1. Example for Lit (`@nan0web/ui-lit`)

```javascript
export class BaseCatalogView extends LitElement {
  // 1. Storage Key based on URL
  // Note: Arguments are passed as functions (getters) so the controller can reactively re-evaluate
  // them when component properties change (e.g., when switching to another document).
  selectCtrl = new SelectController(this, () => this.document?.$catalog || this.document?.url)

  // 2. Index
  indexCtrl = new DocumentIndexController(
    this,
    () => this.db,
    () => this.document,
    ModelClass,
  )

  // 3. Filter Model (URL-sync with a given scope to avoid collisions)
  filterCtrl = new UrlFilterModelController(this, FilterModelClass, { scope: 'cards' })

  // 4. Pagination
  paginationCtrl = new PaginationController(this, { limit: 20 })

  render() {
    // Filter applies criteria automatically
    let items = this.filterCtrl.model.applyFilter(this.indexCtrl.items)

    // Pagination
    items = this.paginationCtrl.apply(items)

    return html`
      <catalog-layout>
        <!-- Render filter model as a universal form -->
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

### 4.2. Example for React (`@nan0web/ui-react`)

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

  // Filter as a model with scope
  const { filterModel, updateFilter } = useUrlFilterModel(FilterModelClass, { scope: 'cards' })

  // Client-side scenario (index is fully loaded)
  // For Server-side, filterModel parameters and page/limit would be passed to the hook here
  const { items, isLoading } = useDocumentIndex(db, document, basePath, ModelClass)

  // Pagination (Client-side)
  const { page, limit, setPage, pagedItems } = usePagination(filterModel.applyFilter(items), {
    defaultLimit: 20,
  })

  return (
    <CatalogLayout>
      {/* FormViewer renders FilterModel fields */}
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
