/**
 * Nan0ComponentNode
 * Represents a NaN0Web component inside the Lexical tree
 * (e.g. `App.Header`, `Card.Details`, `App.Deposits.Calculator`).
 *
 * Serialized shape:
 * ```json
 * {
 *   "type": "nan0-component",
 *   "version": 1,
 *   "component": "Card.Details",
 *   "props": { "card": "$" }
 * }
 * ```
 *
 * Renders in the editor as a read-only placeholder for now. A future
 * phase adds React components + props forms for editing.
 */
import { DecoratorNode, $applyNodeReplacement } from 'lexical'

export class Nan0ComponentNode extends DecoratorNode {
  /** @type {string} */ __component
  /** @type {Record<string, any>} */ __props

  constructor({ component, props = {}, key }) {
    super(key)
    this.__component = component
    this.__props = props
  }

  static clone(node) {
    return new this({ component: node.__component, props: { ...node.__props }, key: node.__key })
  }

  static getType() {
    return 'nan0-component'
  }

  static importJSON(serializedNode) {
    return $createNan0ComponentNode({
      component: serializedNode.component,
      props: serializedNode.props || {},
    })
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'nan0-component',
      version: 1,
      component: this.__component,
      props: this.__props,
    }
  }

  getComponent() {
    return this.getLatest().__component
  }

  getProps() {
    return this.getLatest().__props
  }

  isInline() {
    return false
  }

  createDOM() {
    const el = document.createElement('div')
    el.setAttribute('data-nan0-component', this.__component)
    el.className = 'nan0-component-placeholder'
    el.style.border = '1px dashed #c8a'
    el.style.padding = '8px'
    el.style.margin = '4px 0'
    el.style.borderRadius = '4px'
    el.style.background = '#fdf6ff'
    el.style.fontSize = '0.85em'
    el.style.color = '#a55'
    el.textContent = `[component: ${this.__component}]`
    return el
  }

  updateDOM() {
    return false
  }

  decorate() {
    return null
  }
}

export function $createNan0ComponentNode({ component, props = {} }) {
  return $applyNodeReplacement(new Nan0ComponentNode({ component, props }))
}

export function $isNan0ComponentNode(node) {
  return node instanceof Nan0ComponentNode
}