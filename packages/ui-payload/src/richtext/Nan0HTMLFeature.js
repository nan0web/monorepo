/**
 * Nan0HTMLFeature
 * Payload Lexical feature that registers the NaN0 custom nodes
 * (nan0-element, nan0-raw, nan0-component) for server + client.
 *
 * Usage in a Payload collection:
 * ```js
 * editor: lexicalEditor({
 *   features: ({ defaultFeatures }) => [
 *     ...defaultFeatures,
 *     Nan0HTMLFeature(),
 *   ],
 * })
 * ```
 */
import { createServerFeature } from '@payloadcms/richtext-lexical'
import { convertLexicalNodesToHTML } from '@payloadcms/richtext-lexical'
import { createNode } from '@payloadcms/richtext-lexical'
import { Nan0ElementNode } from './Nan0ElementNode.js'
import { Nan0RawNode } from './Nan0RawNode.js'
import { Nan0ComponentNode } from './Nan0ComponentNode.js'

export const Nan0HTMLFeature = createServerFeature({
  key: 'nan0html',
  feature: {
    ClientFeature: '@nan0web/ui-payload/richtext/client#Nan0HTMLFeatureClient',
    nodes: [
      createNode({
        node: Nan0ElementNode,
        converters: {
          html: {
            converter: async ({
              converters,
              currentDepth,
              depth,
              draft,
              node,
              overrideAccess,
              parent,
              req,
              showHiddenFields,
            }) => {
              const childrenText = await convertLexicalNodesToHTML({
                converters,
                currentDepth,
                depth,
                draft,
                lexicalNodes: node.children,
                overrideAccess,
                parent: { ...node, parent },
                req,
                showHiddenFields,
              })
              const attrs = node.getAttributes() || {}
              const attrString = Object.entries(attrs)
                .filter(([k]) => k !== 'class' && k !== 'style')
                .map(([k, v]) => `${k}="${String(v).replaceAll('"', '&quot;')}"`)
                .join(' ')
              const classAttr = attrs.class ? ` class="${Array.isArray(attrs.class) ? attrs.class.join(' ') : attrs.class}"` : ''
              const styleAttr = attrs.style ? ` style="${String(attrs.style).replaceAll('"', '&quot;')}"` : ''
              return `<${node.getTag()}${classAttr}${styleAttr}${attrString ? ' ' + attrString : ''}>${childrenText}</${node.getTag()}>`
            },
            nodeTypes: [Nan0ElementNode.getType()],
          },
        },
      }),
      createNode({
        node: Nan0RawNode,
        converters: {
          html: {
            converter: ({ node }) => {
              const source = node.getSource() || {}
              return `<!-- nan0-raw:${source.tag || 'unknown'} -->`
            },
            nodeTypes: [Nan0RawNode.getType()],
          },
        },
      }),
      createNode({
        node: Nan0ComponentNode,
        converters: {
          html: {
            converter: ({ node }) => {
              return `<!-- nan0-component:${node.getComponent()} -->`
            },
            nodeTypes: [Nan0ComponentNode.getType()],
          },
        },
      }),
    ],
  },
})

export default Nan0HTMLFeature