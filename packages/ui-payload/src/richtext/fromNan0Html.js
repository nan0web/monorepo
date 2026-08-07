/**
 * fromNan0Html
 * Converts a NaN0HTML AST (page.content / content) into a Payload Lexical state JSON.
 *
 * NaN0HTML AST shape:
 *   - array       → sequence of blocks
 *   - string      → text content
 *   - object      → element with keys: `$attr` for attributes, lowercase tag keys for
 *                   child elements, `Uppercase.With.Dot` keys for NaN0 components
 *   - `tag: true` → void element (e.g. `br`, `hr`)
 *
 * Strategy:
 *   - Clean elements (no attributes) map to native Lexical nodes where possible.
 *   - Elements carrying any `$`-attribute are preserved losslessly as a `nan0-element`
 *     node (tag + attributes + children) so round-trip back to NaN0HTML is lossless.
 *   - Unknown tags fall back to a `nan0-raw` node and are recorded in the inventory.
 *   - NaN0 components (`App.Header`, `Card.Details`, ...) become `nan0-component` nodes.
 *
 * The converter returns a plain structure; localization is handled at the Payload
 * collection level, not here.
 */

// Lexical text format bitmask
export const FORMAT = Object.freeze({
  bold: 1 << 0,
  italic: 1 << 1,
  underline: 1 << 2,
  strikethrough: 1 << 3,
})

// Native block-level tags we can represent without a custom node.
const BLOCK_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'hr', 'br',
  'table', 'thead', 'tbody', 'tr', 'td', 'th',
])

// Tags that map to native Lexical nodes.
const NATIVE_TAG_MAP = {
  p: 'paragraph',
  h1: 'heading', h2: 'heading', h3: 'heading', h4: 'heading', h5: 'heading', h6: 'heading',
  blockquote: 'blockquote',
  hr: 'horizontalrule',
  br: 'linebreak',
}

// Inline formatting tags → format bit added to descendant text nodes.
const INLINE_FORMAT = {
  strong: FORMAT.bold,
  b: FORMAT.bold,
  em: FORMAT.italic,
  i: FORMAT.italic,
  u: FORMAT.underline,
}

/**
 * Recursively walk the NaN0HTML AST and collect unknown constructs.
 * @param {any} node
 * @param {Array<{tag: string, attributes: Object, parent: string}>} out
 * @param {string} parent
 */
export function inventoryNan0Html(node, out = [], parent = 'root') {
  if (node == null) return out
  if (Array.isArray(node)) {
    for (const child of node) inventoryNan0Html(child, out, parent)
    return out
  }
  if (typeof node !== 'object') return out
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue
    if (/^[a-z][a-z0-9]*$/.test(key)) {
      if (!BLOCK_TAGS.has(key) && key !== 'a' && key !== 'img' && key !== 'span' && key !== 'div' && key !== 'wbr' && key !== 'small' && key !== 'sup') {
        out.push({ tag: key, parent, attributes: collectAttrs(value) })
      }
      inventoryNan0Html(value, out, key)
    } else if (/^[A-Z]/.test(key) && key.includes('.')) {
      out.push({ component: key, parent })
      inventoryNan0Html(value, out, key)
    } else {
      inventoryNan0Html(value, out, parent)
    }
  }
  return out
}

function collectAttrs(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const attrs = {}
  for (const [k, v] of Object.entries(value)) {
    if (k.startsWith('$')) attrs[k.slice(1)] = v
  }
  return attrs
}

/**
 * Convert a NaN0HTML AST into a Payload Lexical root state.
 * @param {any} content NaN0HTML AST (array of blocks, or a single block)
 * @returns {{ root: { type: string, version: number, children: any[] } }}
 */
export function fromNan0Html(content) {
  const children = convertBlock(content, 0)
  return {
    root: {
      type: 'root',
      version: 1,
      children,
    },
  }
}

/**
 * Convert a block (array of elements, or a single element) into Lexical children.
 */
function convertBlock(node, format) {
  if (node == null) return []
  if (Array.isArray(node)) {
    const out = []
    for (const child of node) {
      out.push(...convertBlock(child, format))
    }
    return out
  }
  if (typeof node === 'string') {
    return [textNode(node, format)]
  }
  if (typeof node !== 'object') return []
  // Object: split `$`-attributes from element keys.
  const attrs = {}
  const elements = []
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) {
      attrs[key.slice(1)] = value
      continue
    }
    elements.push([key, value])
  }
  const out = []
  for (const [tag, value] of elements) {
    out.push(...convertElement(tag, value, attrs, format))
  }
  return out
}

/**
 * Convert a single tag element into Lexical nodes.
 * `attrs` are the attributes collected at the same object level.
 */
function convertElement(tag, value, attrs, format) {
  // NaN0 component
  if (/^[A-Z]/.test(tag) && tag.includes('.')) {
    const props = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
    return [componentNode(tag, props)]
  }

  // Inline formatting tags alter the text format of descendants.
  if (INLINE_FORMAT[tag] != null) {
    const childFormat = format | INLINE_FORMAT[tag]
    return convertBlock(value, childFormat)
  }

  let children = []
  if (value === true) {
    // void element
    children = []
  } else if (Array.isArray(value) || typeof value === 'string') {
    children = convertBlock(value, format)
  } else if (value && typeof value === 'object') {
    children = convertBlock(value, format)
  }

  const hasAttrs = Object.keys(attrs).length > 0

  switch (tag) {
    case 'p':
      if (hasAttrs) return [elementNode(tag, attrs, children)]
      return [blockNode('paragraph', children)]
    case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
      if (hasAttrs) return [elementNode(tag, attrs, children)]
      return [blockNode('heading', children, { tag })]
    case 'blockquote':
      if (hasAttrs) return [elementNode(tag, attrs, children)]
      return [blockNode('blockquote', children)]
    case 'hr':
      if (hasAttrs) return [elementNode(tag, attrs, [])]
      return [{ type: 'horizontalrule', version: 1 }]
    case 'br':
      if (hasAttrs) return [elementNode(tag, attrs, [])]
      return [{ type: 'linebreak', version: 1 }]
    case 'ul': case 'ol':
      if (hasAttrs) return [elementNode(tag, attrs, children)]
      return [listNode(tag, value, children)]
    case 'li':
      if (hasAttrs) return [elementNode(tag, attrs, children)]
      return [{ type: 'listitem', version: 1, value: 1, children }]
    case 'a': {
      const url = attrs.href || '#'
      const linkAttrs = { url, linkType: 'custom' }
      if (attrs.target) linkAttrs.newTab = String(attrs.target) === '_blank'
      if (attrs.rel) linkAttrs.rel = attrs.rel
      const node = { type: 'link', version: 1, fields: linkAttrs, children }
      // Preserve extra attributes losslessly.
      return [wrapElementIfNeeded(tag, attrs, node)]
    }
    case 'img': {
      const src = attrs.src || ''
      const node = {
        type: 'upload',
        version: 1,
        fields: { relationTo: 'media', value: src },
        children: [],
      }
      return [wrapElementIfNeeded(tag, attrs, node)]
    }
    case 'table': case 'thead': case 'tbody':
      if (hasAttrs) return [elementNode(tag, attrs, children)]
      return [{ type: 'table', version: 1, children }]
    case 'tr':
      if (hasAttrs) return [elementNode(tag, attrs, children)]
      return [{ type: 'tablerow', version: 1, children }]
    case 'td': case 'th': {
      const cell = { type: 'tablecell', version: 1, header: tag === 'th', children }
      return [wrapElementIfNeeded(tag, attrs, cell)]
    }
    case 'span': case 'div': case 'section': case 'header': case 'nav':
    case 'figure': case 'caption': case 'small': case 'sup': case 'wbr':
    case 'picture': case 'source':
      // These are either inline or block wrappers; preserve attributes if any.
      if (hasAttrs) return [elementNode(tag, attrs, children)]
      return [blockNode('paragraph', children)]
    default:
      // Unknown tag → preserve losslessly as nan0-raw.
      return [rawNode(tag, attrs, children)]
  }
}

/**
 * If the element carries attributes beyond those consumed by the native node,
 * wrap it in a lossless `nan0-element` node so nothing is dropped.
 */
function wrapElementIfNeeded(tag, attrs, node) {
  if (!attrs) return [node]
  return [elementNode(tag, attrs, node.children || [])]
}

function textNode(text, format) {
  return { type: 'text', text, format }
}

function blockNode(type, children, extra = {}) {
  return { type, version: 1, ...extra, children }
}

function listNode(tag, value, children) {
  const listType = tag === 'ol' ? 'number' : 'bullet'
  let start = 1
  if (value && typeof value === 'object' && !Array.isArray(value) && value.$start != null) {
    start = Number(value.$start) || 1
  }
  return { type: 'list', version: 1, listType, start, tag, children }
}

function elementNode(tag, attrs, children) {
  return {
    type: 'nan0-element',
    version: 1,
    tag,
    attributes: attrs,
    children,
  }
}

function componentNode(component, props) {
  return {
    type: 'nan0-component',
    version: 1,
    component,
    props,
  }
}

function rawNode(tag, attrs, children) {
  return {
    type: 'nan0-raw',
    version: 1,
    source: {
      tag,
      attributes: attrs,
      children,
    },
  }
}

export default fromNan0Html