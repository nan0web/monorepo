/**
 * Nan0RawNode
 * Fallback for unknown NaN0HTML tags and structures that do not yet have
 * a native or nan0-element adapter.
 *
 * Serialized shape:
 * ```json
 * {
 *   "type": "nan0-raw",
 *   "version": 1,
 *   "source": {
 *     "tag": "legacy-widget",
 *     "attributes": { "data-mode": "legacy" },
 *     "children": []
 *   }
 * }
 * ```
 *
 * In the editor, this renders as a read-only block showing the tag name
 * so the user knows something is stored but not yet editable natively.
 * A future migration can replace nan0-raw with the appropriate node.
 */
import { ElementNode, $applyNodeReplacement } from 'lexical'

export class Nan0RawNode extends ElementNode {
  /** @type {{ tag: string, attributes: Record<string, any>, children: any[] }} */ __source

  constructor({ source, key }) {
    super(key)
    this.__source = source
  }

  static clone(node) {
    return new this({ source: { ...node.__source }, key: node.__key })
  }

  static getType() {
    return 'nan0-raw'
  }

  static importJSON(serializedNode) {
    return $createNan0RawNode({ source: serializedNode.source || { tag: 'unknown', attributes: {}, children: [] } })
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'nan0-raw',
      version: 1,
      source: this.__source,
    }
  }

  getSource() {
    return this.getLatest().__source
  }

  isInline() {
    return false
  }

  canBeEmpty() {
    return true
  }

  createDOM(config) {
    const el = document.createElement('div')
    el.setAttribute('data-nan0-raw', this.__source.tag)
    el.className = 'nan0-raw-fallback'
    el.style.border = '1px dashed #ccc'
    el.style.padding = '8px'
    el.style.margin = '4px 0'
    el.style.borderRadius = '4px'
    el.style.background = '#fafafa'
    el.style.fontSize = '0.85em'
    el.style.color = '#888'
    el.textContent = `[nan0-raw: ${this.__source.tag}]`
    return el
  }

  updateDOM() {
    return false
  }
}

export function $createNan0RawNode({ source }) {
  return $applyNodeReplacement(new Nan0RawNode({ source }))
}

export function $isNan0RawNode(node) {
  return node instanceof Nan0RawNode
}