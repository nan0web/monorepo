# Examples

## Lit Adapter

```typescript
import { LitElement, html } from 'lit'
import { EditorModel } from '@nan0web/editor'
import DB from '@nan0web/db-browser'

class DemoEditor extends LitElement {
  model = new EditorModel({ db: new DB(), uri: 'page.yml' })

  async connectedCallback() {
    super.connectedCallback()
    await this.model.loadDocument()
    this.requestUpdate()
  }

  render() {
    return html`<div>Editing: ${this.model.content?.title}</div>`
  }
}
customElements.define('demo-editor', DemoEditor)
```
