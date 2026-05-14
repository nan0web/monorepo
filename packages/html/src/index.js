import { escape } from '@nan0web/xml'
import HTMLTags from './HTMLTags.js'
import HTMLTransformer from './Transformer.js'

const defaultHTML5Tags = new HTMLTags()

export { HTMLTags, HTMLTransformer, defaultHTML5Tags, escape }

export default HTMLTransformer
