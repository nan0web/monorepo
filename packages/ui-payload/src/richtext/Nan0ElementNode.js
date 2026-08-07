/**
 * Nan0ElementNode
 * Lossless wrapper for NaN0HTML elements that carry `$`-attributes.
 *
 * Serialized shape:
 * ```json
 * { "type": "nan0-element", "version": 1, "tag": "div", "attributes": { "class": "..." }, "children": [...] }
 * ```
 *
 * This node is used when a native Lexical node cannot represent the attributes
 * without data loss. Clean elements (no attributes) use native nodes directly.
 */
import { ElementNode, $applyNodeReplacement } from 'lexical'

export class Nan0ElementNode extends ElementNode {
  /** @type {string} */ __tag
  /** @type {Record<string, any>} */ __attributes

  constructor({ tag, attributes = {}, key }) {
    super(key)
    this.__tag = tag
    this.__attributes = attributes
  }

  static clone(node) {
    return new this({ tag: node.__tag, attributes: { ...node.__attributes }, key: node.__key })
  }

  static getType() {
    return 'nan0-element'
  }

  static importJSON(serializedNode) {
    const node = $createNan0ElementNode({
      tag: serializedNode.tag,
      attributes: serializedNode.attributes || {},
    })
    return node
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'nan0-element',
      version: 1,
      tag: this.__tag,
      attributes: this.__attributes,
    }
  }

  getTag() {
    return this.getLatest().__tag
  }

  getAttributes() {
    return this.getLatest().__attributes
  }

  isInline() {
    return false
  }

  canBeEmpty() {
    return true
  }

  createDOM(config) {
    const element = document.createElement(this.__tag || 'div')
    const attrs = this.__attributes || {}
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'class') {
        element.className = Array.isArray(value) ? value.join(' ') : String(value)
      } else if (key === 'style' && typeof value === 'string') {
        element.setAttribute('style', value)
      } else if (typeof value === 'string' || typeof value === 'number') {
        element.setAttribute(key, String(value))
      }
    }
    return element
  }

  updateDOM() {
    return false
  }
}

export function $createNan0ElementNode({ tag, attributes = {} }) {
  return $applyNodeReplacement(new Nan0ElementNode({ tag, attributes }))
}

export function $isNan0ElementNode(node) {
  return node instanceof Nan0ElementNode
}