# @nan0web/comment

Universal, zero-hardcode, zero-logic comment & feedback overlay.
Perfect for QA auditing, UI feedback, and contextual page annotations.

## Installation

How to install with npm?
```bash
npm install @nan0web/comment
```

## Architecture
Designed strictly on the OLMUI (One Logic — Many UI) and Architechnomag principles:
1. **Zero-Logic UI:** The React/Web adapter only handles DOM nodes. Validation rules and flows live in `CommentModel`.
2. **Zero-Hardcode & i18n:** All translation labels are yielded by the Model, the UI adapters never import static languages.
3. **Model-as-Schema:** Fully declarative definition of the feedback process.
4. **URL Scoped:** Comments inherently bind to the current page path, cleanly separating localized variations (e.g., `/uk/` vs `/en/`).

## Usage
### Basic Implementation

Wrap any simple persistence mechanism (like `localStorage` or `IndexedDB`) 
into a basic DB interface `{ save, loadAll, remove, clear }` and pass it to the adapter.

How to initialize and start the comment overlay?
```js
import { WebCommentAdapter } from '@nan0web/comment'
// 1. Create a dummy DB for storing comments
class DemoDB {
	async save(comment) { console.info('Saved:', comment.text) }
	async loadAll() { return [] }
	async clear() {}
	async remove() {}
}
// 2. Initialize the adapter
const adapter = new WebCommentAdapter({
	db: new DemoDB(),
	t: (key) => key // simple mock translator
})
// 3. Start the flow programmatically
// adapter.start().then(result => console.info(result.action))
```
### Comments Dashboard & Import/Export

The adapter organically brings a Comments Dashboard panel containing:
- Viewing existing comments bound to the current URL.
- Highlighting exact elements on the page (by CSS Selector) using Crosshairs.
- Real-time bulk JSON Import/Export right out of the box.

How to open the Comments Dashboard?
```js
import { WebCommentAdapter } from '@nan0web/comment'
const adapter = new WebCommentAdapter({
	db: { async loadAll() { return [] }, async save() {}, async clear() {}, async remove() {} },
	t: (k) => k
})
// Programmatically open the List Panel
// adapter.showCommentList()
```
## Core Logic (CommentModel)

Advanced use cases can directly interact with the `CommentModel` generator to bypass the Web adapter (e.g. for CLI tooling or Unit Tests).

How to use CommentModel generator?
```js
import { CommentModel } from '@nan0web/comment/domain'
const model = new CommentModel()
```
## License

How to license? - [ISC LICENSE]($pkgURL/blob/main/LICENSE) file.
