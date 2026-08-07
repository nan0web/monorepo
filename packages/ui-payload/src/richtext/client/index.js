/**
 * Nan0HTMLFeatureClient
 * Client-side registration of NaN0 custom nodes for the Lexical editor.
 * Imported via the Payload import map from `@nan0web/ui-payload/richtext/client`.
 */
'use client'

import { Nan0ElementNode } from '../Nan0ElementNode.js'
import { Nan0RawNode } from '../Nan0RawNode.js'
import { Nan0ComponentNode } from '../Nan0ComponentNode.js'

export const Nan0HTMLFeatureClient = (props = {}) => ({
  clientFeatureProps: props,
  feature: () => ({
    nodes: [Nan0ElementNode, Nan0RawNode, Nan0ComponentNode],
    sanitizedClientFeatureProps: props,
  }),
})

export default Nan0HTMLFeatureClient