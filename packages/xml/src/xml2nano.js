import unescape from './unescape.js'

/**
 * Parse XML attributes from a tag string fragment.
 * @param {string} attrStr - Attribute portion of an opening tag.
 * @returns {Object} Object with $-prefixed attribute keys.
 */
function parseAttrs(attrStr) {
	const attrs = {}
	const re = /([\w:.-]+)\s*=\s*"([^"]*)"/g
	let m
	while ((m = re.exec(attrStr)) !== null) {
		attrs['$' + m[1]] = unescape(m[2])
	}
	return attrs
}

/**
 * Convert an array of parsed node descriptors into nan•style content.
 * @param {Array} nodes - Parsed node descriptors.
 * @returns {string|Object} Text content or nano object.
 */
function nodesToContent(nodes) {
	const hasStructure = nodes.some(
		(n) => n.type === 'element' || n.type === 'comment' || n.type === 'pi',
	)

	if (!hasStructure) {
		const textNodes = nodes.filter((n) => n.type === 'text')
		if (textNodes.length === 0) return ''
		return textNodes.map((n) => n.value).join('')
	}

	const result = {}

	for (const node of nodes) {
		if (node.type === 'element') {
			if (node.tag in result) {
				if (Array.isArray(result[node.tag])) {
					result[node.tag].push(node.content)
				} else {
					result[node.tag] = [result[node.tag], node.content]
				}
			} else {
				result[node.tag] = node.content
			}
			Object.assign(result, node.attrs)
		} else if (node.type === 'comment') {
			result['#comment'] = node.value
		} else if (node.type === 'pi') {
			result[node.tag] = true
			Object.assign(result, node.attrs)
		}
	}

	return result
}

/**
 * Parse an XML string into a nan•style JavaScript object.
 * This is the inverse of nano2xml().
 * Zero external dependencies — pure RegExp-based tokenizer.
 *
 * @param {string} xmlStr - The XML string to parse.
 * @returns {Object} The nan•style JavaScript object.
 */
function xml2nano(xmlStr) {
	const str = xmlStr.trim()
	let pos = 0

	/**
	 * Parse nodes from current position until a closing tag is found.
	 * @param {string|null} stopTag - Tag name to stop at, or null for root.
	 * @returns {Array} Array of node descriptors.
	 */
	function parseNodes(stopTag) {
		const nodes = []

		while (pos < str.length) {
			if (stopTag && str.startsWith('</' + stopTag, pos)) {
				pos = str.indexOf('>', pos) + 1
				break
			}

			if (str[pos] !== '<') {
				const nextTag = str.indexOf('<', pos)
				const text = nextTag === -1 ? str.slice(pos) : str.slice(pos, nextTag)
				pos = nextTag === -1 ? str.length : nextTag
				if (text.trim()) {
					nodes.push({ type: 'text', value: unescape(text.trim()) })
				}
				continue
			}

			// Comment <!-- ... -->
			if (str.startsWith('<!--', pos)) {
				const end = str.indexOf('-->', pos + 4)
				nodes.push({ type: 'comment', value: str.slice(pos + 4, end).trim() })
				pos = end + 3
			}
			// CDATA <![CDATA[ ... ]]>
			else if (str.startsWith('<![CDATA[', pos)) {
				const end = str.indexOf(']]>', pos + 9)
				nodes.push({ type: 'text', value: str.slice(pos + 9, end) })
				pos = end + 3
			}
			// Processing instruction <? ... ?>
			else if (str.startsWith('<?', pos)) {
				const end = str.indexOf('?>', pos + 2)
				const inner = str.slice(pos + 2, end).trim()
				const sp = inner.search(/\s/)
				const name = sp === -1 ? inner : inner.slice(0, sp)
				const attrStr = sp === -1 ? '' : inner.slice(sp)
				nodes.push({ type: 'pi', tag: '?' + name, attrs: parseAttrs(attrStr) })
				pos = end + 2
			}
			// Unexpected closing tag — stop
			else if (str[pos + 1] === '/') {
				break
			}
			// Opening tag
			else {
				const closeIdx = str.indexOf('>', pos)
				const tagContent = str.slice(pos + 1, closeIdx)
				const isSelfClosing = tagContent.endsWith('/')
				const cleanTag = isSelfClosing ? tagContent.slice(0, -1).trim() : tagContent.trim()
				const sp = cleanTag.search(/\s/)
				const tagName = sp === -1 ? cleanTag : cleanTag.slice(0, sp)
				const attrStr = sp === -1 ? '' : cleanTag.slice(sp)
				const attrs = parseAttrs(attrStr)
				pos = closeIdx + 1

				if (isSelfClosing) {
					nodes.push({ type: 'element', tag: tagName, attrs, content: true })
				} else {
					const children = parseNodes(tagName)
					const content = nodesToContent(children)
					nodes.push({ type: 'element', tag: tagName, attrs, content })
				}
			}
		}

		return nodes
	}

	const topNodes = parseNodes(null)
	const result = {}

	for (const node of topNodes) {
		if (node.type === 'element') {
			result[node.tag] = node.content
			Object.assign(result, node.attrs)
		} else if (node.type === 'comment') {
			result['#comment'] = node.value
		} else if (node.type === 'pi') {
			result[node.tag] = true
			Object.assign(result, node.attrs)
		}
	}

	return result
}

export default xml2nano
