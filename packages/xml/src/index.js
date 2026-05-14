import Case from './Case.js'
import escape from './escape.js'
import unescape from './unescape.js'
import nano2attrs from './nano2attrs.js'
import nano2xml from './nano2xml.js'
import xml2nano from './xml2nano.js'
import XMLTransformer from './Transformer.js'
import XMLTags from './XMLTags.js'

const defaultXMLTags = new XMLTags()

export {
	Case,
	escape,
	unescape,
	nano2attrs,
	nano2xml,
	xml2nano,
	defaultXMLTags,
	XMLTags,
	XMLTransformer,
}

export default XMLTransformer
