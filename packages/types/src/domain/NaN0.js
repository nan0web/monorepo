import Parser from './Parser/Parser.js'
import Node from './Parser/Node.js'

/**
 * @typedef {Object} Context
 * @property {Array<{ text: string, id: string }>} [comments=[]]
 * @property {number} [i]
 * @property {string} [next]
 * @property {typeof Object} [Body]
 */

/**
 * NaN0 format - "0 is not a number" - zero is a universe that is a source of any
 * other numbers and else.
 * The word rea1 means subjective reality, because everyone's reality is different.
 * The word g0d means god as infinite energy and everything else is a part of it.
 * So there is no objective reality until everyone becomes an only one that is g0d.
 * Becomes here means rea1ize the rea0ity.
 * @example The top level element of NaN0 document can be any of NaN0 types.
 *          NaN0 document is useful in cases of storing pure data such as types:
 *          boolean, number, string, date, object, array, array of previous types.
 *          These types can cover most of business cases when structuring data into
 *          classes and nested and connected business logic as it is in rea1 life.
 */

export default class NaN0 {
	static NEW_LINE = '\n'
	static TAB = '  '
	static EMPTY_ARRAY = '[]'
	static EMPTY_DATE = '0000-00-00'
	static EMPTY_OBJECT = '{}'
	static MULTILINE_START = '|'
	static VALUE_DELIMITER = [': ', /^(.+):$/]
	static COMMENT_START = '# '

	static numberRegex = /^-?\d+(?:_\d+)*(?:\.\d+(?:_\d+)*)?$/
	static dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(?:[+-]\d{2}:\d{2}|[+-]\d{4}|Z)?)?$/
	static tzSuffixRegex = /[+-]\d{4}$/
	static tzMatchRegex = /([+-]\d{4})$/

	/**
	 * @param {string} str
	 * @param {string} [key]
	 * @param {Context} [context]
	 * @returns {any}
	 */
	static parseValue(str, key, context) {
		const s = str.trim()
		if (s.length === 0) return ''

		// Priority 1: Check if the type is explicitly defined as String in the Body schema
		const bodyType = context?.Body
		if (bodyType === /** @type {any} */ (String) || (key && (/** @type {any} */ (bodyType))?.[key]?.type === String)) {
			return s
		}

		// Priority 2: Booleans, Null, Empty collections (Quick string checks)
		if (s === 'true') return true
		if (s === 'false') return false
		if (s === 'null') return null

		// Priority 3: Numbers (Frequent in data)
		const firstChar = s[0]
		if ((firstChar >= '0' && firstChar <= '9') || firstChar === '-') {
			if (this.numberRegex.test(s)) {
				if (s.length > 1 && s[0] === '0' && s[1] !== '.') return s
				const asNum = Number(s.replace(/_/g, ''))
				if (!isNaN(asNum)) return asNum
			}
			// Date check (only if it starts like a number)
			if (s.length >= 10 && this.dateRegex.test(s)) {
				let dateStr = s
				if (this.tzSuffixRegex.test(s) && !s.includes(':')) {
					const tzMatch = s.match(this.tzMatchRegex)
					if (tzMatch) {
						const tz = tzMatch[1]
						dateStr = s.replace(tz, `${tz[0]}${tz.substring(1, 3)}:${tz.substring(3)}`)
					}
				}
				const asDate = new Date(dateStr)
				if (!isNaN(asDate.getTime())) return asDate
			}
		}

		// Priority 4: Quoted strings
		if (firstChar === '"' && s.endsWith('"')) {
			try {
				return JSON.parse(s)
			} catch {
				return s.slice(1, -1)
			}
		}

		return s
	}

	static formatValue(value) {
		if (value === null) return 'null'
		if (typeof value === 'boolean') return value.toString()
		if (typeof value === 'number') {
			if (Number.isNaN(value)) return 'NaN'
			let numStr = value.toString()
			if (numStr === '-0') numStr = '0'
			return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '_')
		}
		if (value instanceof Date) {
			const year = value.getFullYear()
			if (isNaN(year)) return this.EMPTY_DATE
			const month = String(value.getMonth() + 1).padStart(2, '0')
			const day = String(value.getDate()).padStart(2, '0')
			const dateStr = `${year}-${month}-${day}`
			const hours = String(value.getHours()).padStart(2, '0')
			const minutes = String(value.getMinutes()).padStart(2, '0')
			const seconds = String(value.getSeconds()).padStart(2, '0')
			if (hours === '00' && minutes === '00' && seconds === '00') {
				return dateStr
			}
			return `${dateStr}T${hours}:${minutes}:${seconds}`
		}
		if (typeof value === 'string') {
			if (
				value.includes('"') ||
				value.includes(this.NEW_LINE) ||
				value.trim() === '' ||
				/[:#]/.test(value)
			) {
				const escaped = value.replace(/"/g, '\\"')
				return `"${escaped}"`
			}
			return value
		}
		return String(value)
	}

	/**
	 * @param {string} text
	 * @param {string | RegExp | Array<string | RegExp>} condition
	 * @returns {{ condition: string | RegExp, name: string } | false}
	 */
	static match(text, condition) {
		if (!Array.isArray(condition)) {
			condition = [condition]
		}
		for (const cond of condition) {
			if (cond instanceof RegExp) {
				const found = text.match(cond)
				if (found) {
					return { condition: cond, name: found[1] }
				}
			}
			if ('string' === typeof cond && text.includes(cond)) {
				const [name] = text.split(cond)
				return { condition: cond, name }
			}
		}
		return false
	}

	static parseComments(allChildren, startIdx = 0) {
		let commentLines = []
		let i = startIdx
		let nextIdx = '.'
		while (i < allChildren.length) {
			const c = allChildren[i]
			const ct = c.content.trim()
			if (ct !== '' && !ct.startsWith(this.COMMENT_START)) {
				const found = this.match(ct, this.VALUE_DELIMITER)
				if (found) {
					nextIdx = found.name
				}
				break
			}
			if (ct.startsWith(this.COMMENT_START)) {
				let commentText = ct.slice(this.COMMENT_START.length).trim()
				if (c.children.length > 0) {
					const subComments = c.children
						.map((sub) => sub.content.trim())
						.filter((sub) => sub !== '')
						.join('\n')
					if (subComments) commentText += `\n${subComments}`
				}
				commentLines.push(commentText)
			}
			i++
		}
		return { comments: commentLines.join('\n'), nextIdx, i }
	}

	/**
	 * @param {any[]} allChildren
	 * @param {number} level
	 * @param {Context} context
	 * @returns {any}
	 */
	static parseContainer(allChildren, level = 0, context = { comments: [], i: 0 }) {
		if (allChildren.length === 0) return {}
		let { comments: topComments, i, nextIdx } = this.parseComments(allChildren)
		if (i >= allChildren.length) {
			const result = {}
			if (topComments) {
				context.comments?.push({ text: topComments, id: '.' })
			}
			return result
		}
		const firstNode = allChildren[i]
		const firstContent = firstNode.content.trim()

		/* ---------- EMPTY ARRAY ---------- */
		if (firstContent === this.EMPTY_ARRAY) {
			let result = []
			if (topComments || firstNode.children.length > 0) {
				const emptyComments = topComments ? `${topComments}\n` : ''
				const subComments = firstNode.children
					.map((c) => c.content)
					.filter((l) => l.trim() !== '')
					.join('\n')
				const allEmptyComments = subComments ? `${emptyComments}${subComments}` : emptyComments
				if (allEmptyComments) {
					/*  comment id for an empty array should refer to the first
					 *  array index (0) when the array is at the root level.
					 *  For nested arrays we keep the original behaviour
					 *  (use the node position `${i}`) to stay compatible
					 *  with existing expectations. */
					const commentId = level === 0 ? `[0]` : `[${i}]`
					context.comments?.push({ text: allEmptyComments.trim(), id: commentId })
				}
			}
			return result
		}

		/* ---------- EMPTY OBJECT ---------- */
		if (firstContent === this.EMPTY_OBJECT) {
			let result = {}
			if (topComments || firstNode.children.length > 0) {
				const emptyComments = topComments ? `${topComments}\n` : ''
				const subComments = firstNode.children
					.map((c) => c.content)
					.filter((l) => l.trim() !== '')
					.join('\n')
				const allEmptyComments = subComments ? `${emptyComments}${subComments}` : emptyComments
				if (allEmptyComments) {
					context.comments?.push({ text: allEmptyComments.trim(), id: nextIdx })
				}
			}
			return result
		}

		const isArray = firstContent.startsWith('- ')
		let result
		if (isArray) {
			if (topComments) {
				const commentId = level === 0 ? `[0]` : `[${i}]`
				context.comments?.push({ text: topComments, id: commentId })
			}
			const arrayChildren = allChildren.slice(i)
			context.i = i
			result = this.parseArrayWithComments(arrayChildren, level, context)
		} else {
			if (topComments) {
				context.comments?.push({ text: topComments, id: nextIdx })
			}
			const objectChildren = allChildren.slice(i)
			context.i = i
			context.next = nextIdx
			result = this.parseObjectWithComments(objectChildren, level, context)
		}
		const isPrimitive = [String, Number, Boolean].includes(/** @type {any} */ (context.Body))
		return context.Body && !isPrimitive ? new (/** @type {any} */ (context.Body))(result) : result
	}

	/**
	 *
	 * @param {any[]} allChildren
	 * @param {number} level
	 * @param {Context} [context]
	 * @returns
	 */
	static parseObjectWithComments(allChildren, level = 0, context = { comments: [] }) {
		const obj = {}
		let i = 0
		let currentComments = ''
		while (i < allChildren.length) {
			const { comments, i: nextI } = this.parseComments(allChildren, i)
			i = nextI
			if (i >= allChildren.length) break
			if (comments) currentComments += (currentComments ? '\n' : '') + comments

			const fieldNode = allChildren[i]
			const fieldContent = fieldNode.content.trim()
			const colonIdx = fieldContent.indexOf(':')
			if (colonIdx === -1) {
				throw new Error(`Invalid object field at level ${level}: no colon in "${fieldContent}"`)
			}
			const key = fieldContent.substring(0, colonIdx).trim()
			let valuePart = fieldContent.substring(colonIdx + 1).trim()
			const hasChildren = fieldNode.children.length > 0

			if (currentComments) {
				context.comments?.push({ text: currentComments, id: key || '.' })
				currentComments = ''
			}

			let value
			if (valuePart === this.MULTILINE_START) {
				// multiline
				const lines = fieldNode.children
					.map((c) => c.content)
					.filter((l) => l.trim() !== '')
					.join(this.NEW_LINE)
				value = lines
			} else if (valuePart === '' && hasChildren) {
				// container - infer sub-Body if available
				const subContext = { ...context, comments: [], Body: undefined }
				if (context.Body?.[key]) {
					subContext.Body = context.Body[key].itemType || context.Body[key].type
				}
				value = this.parseContainer(fieldNode.children, level + 1, subContext)
			} else {
				// same line
				if (valuePart === this.EMPTY_ARRAY) {
					value = []
				} else if (valuePart === this.EMPTY_OBJECT) {
					value = {}
				} else {
					value = this.parseValue(valuePart, key, context)
				}
			}
			obj[key] = value
			i++
			currentComments = ''
		}
		if (currentComments) {
			context.comments?.push({ text: currentComments, id: '.' })
		}
		return obj
	}

	/**
	 *
	 * @param {any[]} allChildren
	 * @param {number} level
	 * @param {Context} context
	 * @returns
	 */
	static parseArrayWithComments(allChildren, level = 0, context = { comments: [] }) {
		const arr = []
		let currentComments = ''
		let i = 0
		while (i < allChildren.length) {
			const { comments, i: nextI } = this.parseComments(allChildren, i)
			i = nextI
			if (i >= allChildren.length) break
			if (comments) currentComments += (currentComments ? '\n' : '') + comments

			const itemNode = allChildren[i]
			if (!itemNode.content.trim().startsWith('- ')) {
				throw new Error(`Invalid array item at level ${level}: "${itemNode.content}"`)
			}
			let content = itemNode.content.trim().replace(/^-\s*/, '').trim()
			const hasChildren = itemNode.children.length > 0

			let value
			let name
			if (!hasChildren) {
				value = this.parseValue(content, undefined, context)
			} else {
				const colonIdx = content.indexOf(':')
				if (content === this.MULTILINE_START) {
					const lines = itemNode.children
						.map((c) => c.content)
						.filter((l) => l.trim() !== '')
						.join(this.NEW_LINE)
					value = lines
				} else if (colonIdx !== -1) {
					name = content.substring(0, colonIdx).trim()
					const valPart = content.substring(colonIdx + 1).trim()

					const subContext = { ...context, comments: [], Body: undefined }
					if (context.Body?.[name]) {
						subContext.Body = context.Body[name].itemType || context.Body[name].type
					}

					if (valPart === '') {
						// key with no inline value → children form a nested container
						const childrenVal = this.parseContainer(itemNode.children, level + 1, subContext)
						value = { [name]: childrenVal }
					} else {
						const childrenVal = this.parseContainer(itemNode.children, level + 1, subContext)
						let directVal;
						if (valPart === this.EMPTY_ARRAY) directVal = [];
						else if (valPart === this.EMPTY_OBJECT) directVal = {};
						else directVal = this.parseValue(valPart, name, context);
						value = { [name]: directVal }
						if (childrenVal && typeof childrenVal === 'object' && !Array.isArray(childrenVal) && Object.keys(childrenVal).length > 0) {
							Object.assign(value, childrenVal)
						} else if (childrenVal && Object.keys(childrenVal).length > 0) {
							value[name] = childrenVal
						}
					}
				} else if (content === '') {
					value = this.parseContainer(itemNode.children, level + 1, context)
				} else {
					throw new Error(
						`Invalid array item with children at level ${level}: "${itemNode.content}"`,
					)
				}
			}
			if (currentComments && value && typeof value === 'object') {
				context.comments?.push({ text: currentComments, id: name || '.' })
				currentComments = ''
			}
			arr.push(value)
			i++
			currentComments = ''
		}
		return arr
	}

	static addValueToNode(parent, value, level, key) {
		const fieldNode = new Node({ content: '', indent: level })
		let content
		let needsChildren = false
		if (Array.isArray(value)) {
			if (value.length === 0) {
				content = `${key}: ${this.EMPTY_ARRAY}`
			} else {
				content = `${key}:`
				needsChildren = true
			}
		} else if (value instanceof Date) {
			content = `${key}: ${this.formatValue(value)}`
		} else if (typeof value === 'string') {
			if (value.includes(this.NEW_LINE)) {
				content = `${key}: ${this.MULTILINE_START}`
				needsChildren = true
			} else {
				const valStr = this.formatValue(value)
				content = `${key}: ${valStr}`
			}
		} else if (value && typeof value === 'object' && value !== null) {
			const keys = Object.keys(value)
			if (keys.length === 0) {
				content = `${key}: ${this.EMPTY_OBJECT}`
			} else {
				content = `${key}:`
				needsChildren = true
			}
		} else {
			const valStr = this.formatValue(value)
			content = `${key}: ${valStr}`
		}
		fieldNode.content = content
		parent.children.push(fieldNode)
		if (needsChildren) {
			if (Array.isArray(value)) {
				value.forEach((item) => this.addArrayItemToNode(fieldNode, item, level + 1))
			} else if (typeof value === 'string') {
				// multiline
				const lines = value.split(this.NEW_LINE).filter((l) => l.trim() !== '')
				lines.forEach((line) =>
					fieldNode.children.push(new Node({ content: line, indent: level + 1 })),
				)
			} else {
				// object
				Object.entries(value).forEach(([subKey, subValue]) =>
					this.addValueToNode(fieldNode, subValue, level + 1, subKey),
				)
			}
		}
	}

	static addArrayItemToNode(parent, item, level) {
		const itemNode = new Node({ content: '', indent: level })
		let content
		let needsChildren = false
		let nodeType = 'simple'
		if (Array.isArray(item)) {
			if (item.length === 0) {
				content = `- ${this.EMPTY_ARRAY}`
			} else {
				content = `-`
				needsChildren = true
				nodeType = 'array'
			}
		} else if (item instanceof Date) {
			content = `- ${this.formatValue(item)}`
		} else if (typeof item === 'string') {
			if (item.includes(this.NEW_LINE)) {
				content = `- ${this.MULTILINE_START}`
				needsChildren = true
				nodeType = 'multiline'
			} else {
				const valStr = this.formatValue(item)
				content = `- ${valStr}`
			}
		} else if (item && typeof item === 'object' && item !== null) {
			const keys = Object.keys(item)
			if (keys.length === 0) {
				content = `- ${this.EMPTY_OBJECT}`
			} else {
				// Multiple keys: first one goes on the same line, others as children
				const entries = Object.entries(item)
				const [subKey, subValue] = entries[0]
				const rest = entries.slice(1)

				const isSubComplex = Array.isArray(subValue)
					? subValue.length > 0
					: subValue && typeof subValue === 'object' && subValue !== null
						? Object.keys(subValue).length > 0
						: typeof subValue === 'string' && subValue.includes(this.NEW_LINE)

				if (isSubComplex) {
					if (typeof subValue === 'string' && subValue.includes(this.NEW_LINE)) {
						content = `- ${subKey}: ${this.MULTILINE_START}`
					} else {
						content = `- ${subKey}:`
					}
					needsChildren = true
					nodeType = 'complex'
					// Note: the subValue itself will be handled by addValueToNode inside stringify
					// but here we have a special case where we want to append 'rest' as well.
					// Actually, simpler: we just set needsChildren = true and let the loop below handle it.
				} else {
					let subValStr
					if (Array.isArray(subValue) && subValue.length === 0) {
						subValStr = this.EMPTY_ARRAY
					} else if (subValue && typeof subValue === 'object' && Object.keys(subValue).length === 0) {
						subValStr = this.EMPTY_OBJECT
					} else {
						subValStr = this.formatValue(subValue)
					}
					content = `- ${subKey}: ${subValStr}`
					needsChildren = true
					nodeType = 'complex'
				}

				// The loop in stringify/addArrayItemToNode needs to handle the logic.
				// Wait, addArrayItemToNode at line 500 handles children based on 'item'.
				// I should probably override the logic here or pass the 'rest' to children.
			}
		} else {
			const valStr = this.formatValue(item)
			content = `- ${valStr}`
		}
		itemNode.content = content
		parent.children.push(itemNode)
		if (needsChildren) {
			if (nodeType === 'multiline') {
				const lines = item.split(this.NEW_LINE).filter((l) => l.trim() !== '')
				lines.forEach((line) =>
					itemNode.children.push(new Node({ content: line, indent: level + 1 })),
				)
			} else if (nodeType === 'array') {
				item.forEach((it) => this.addArrayItemToNode(itemNode, it, level + 1))
			} else if (nodeType === 'complex') {
				const entries = Object.entries(item)
				const [firstKey, firstValue] = entries[0]
				const rest = entries.slice(1)

				// 1. Process first value's children (if any)
				if (Array.isArray(firstValue)) {
					firstValue.forEach((it) => this.addArrayItemToNode(itemNode, it, level + 1))
				} else if (firstValue && typeof firstValue === 'object' && firstValue !== null) {
					Object.entries(firstValue).forEach(([k, v]) =>
						this.addValueToNode(itemNode, v, level + 1, k),
					)
				} else if (typeof firstValue === 'string' && firstValue.includes(this.NEW_LINE)) {
					const lines = firstValue.split(this.NEW_LINE).filter((l) => l.trim() !== '')
					lines.forEach((line) =>
						itemNode.children.push(new Node({ content: line, indent: level + 1 })),
					)
				}

				// 2. Process remaining keys as children of itemNode
				rest.forEach(([k, v]) => this.addValueToNode(itemNode, v, level + 1, k))
			}
		}
	}

	/**
	 * Parses the NaN0 format into an object or array using a high-performance state machine.
	 *
	 * @param {string} input - NaN0 formatted text.
	 * @param {Context} [context={ comments: [], Body: undefined }]
	 * @returns {any} Parsed JavaScript value (object/array).
	 */
	static parse(input, context = { comments: [], Body: undefined }) {
		const parser = new Parser({ eol: this.NEW_LINE, tab: this.TAB })
		let result = null
		let lineNum = 0
		
		/** @type {Array<{ val: any, indent: number, type: 'object' | 'array', key?: string, multiline?: boolean, Body?: any }>} */
		const stack = []
		let bufferedComments = ''
		let lastCommentIndent = -1
		let hasItems = false

		parser.scanLines(input, (line, indent, ln, start, end) => {
			lineNum = ln
			const content = line.trim()
			
			if (content === '') return

			// 0. Multiline string collection (MUST be checked before comments)
			// Pop frames that are at or above current indent
			while (stack.length && indent <= stack[stack.length - 1].indent) {
				stack.pop()
			}
			const topFrame = stack[stack.length - 1]
			if (topFrame?.multiline) {
				topFrame.val[/** @type {string} */ (topFrame.key)] += (topFrame.val[/** @type {string} */ (topFrame.key)] ? '\n' : '') + content
				return
			}

			// 1. Comment continuation (indented lines after a # line)
			if (lastCommentIndent >= 0 && indent > lastCommentIndent) {
				bufferedComments += (bufferedComments ? '\n' : '') + content
				return
			}
			lastCommentIndent = -1

			// 2. Comments handling
			if (content.startsWith('#')) {
				const text = content.startsWith('# ') ? content.slice(2) : content.slice(1)
				bufferedComments += (bufferedComments ? '\n' : '') + text.trim()
				lastCommentIndent = indent
				return
			}

			let parentFrame = topFrame
			
			// Initial root determination
			if (!parentFrame) {
				const isArrayStart = content === this.EMPTY_ARRAY || content.startsWith('- ') || content === '-'
				result = content === this.EMPTY_ARRAY ? [] : (isArrayStart ? [] : {})
				parentFrame = { val: result, indent: -1, type: isArrayStart ? 'array' : 'object', Body: context.Body }
				stack.push(parentFrame)
				// Defer comments for the first key
				if (content === this.EMPTY_ARRAY || content === this.EMPTY_OBJECT) {
					if (bufferedComments) {
						context.comments?.push({ text: bufferedComments, id: isArrayStart ? '[0]' : '.' })
						bufferedComments = ''
					}
					hasItems = true
					return
				}
			}

			// Attached comments helper
			const attachComment = (id) => {
				if (bufferedComments) {
					context.comments?.push({ text: bufferedComments, id })
					bufferedComments = ''
				}
			}

			// 3. Dynamic transition from inferred object to array if child starts with '- '
			if (parentFrame.type === 'object' && (content.startsWith('- ') || content === '-') && parentFrame.key !== undefined) {
				const newVal = []
				const grandFrame = stack[stack.length - 2]
				if (grandFrame) grandFrame.val[parentFrame.key] = newVal
				else result = newVal
				parentFrame.val = newVal
				parentFrame.type = 'array'
				parentFrame.Body = parentFrame.Body?.itemType || parentFrame.Body
			}

			// 4. Parse Content
			if (parentFrame.type === 'array') {
				if (!content.startsWith('- ') && content !== '-') {
					// It's a property following an array item, so it belongs to the parent object frame.
					// Pop the array frame and re-evaluate as object property.
					stack.pop()
					parentFrame = stack[stack.length - 1]
					if (!parentFrame || parentFrame.type !== 'object') {
						throw new Error(`Invalid array item at line ${lineNum}: ${content}`)
					}
				} else {
					const itemContent = content === '-' ? '' : content.slice(2).trim()
					const itemIndex = parentFrame.val.length
					const commentId = `[${itemIndex}]`
				
					if (itemContent === this.EMPTY_ARRAY) {
						parentFrame.val.push([])
						attachComment(commentId)
					} else if (itemContent === this.EMPTY_OBJECT) {
						parentFrame.val.push({})
						attachComment(commentId)
					} else if (itemContent.length >= 2 && itemContent[0] === '"' && itemContent[itemContent.length - 1] === '"') {
						parentFrame.val.push(this.parseValue(itemContent, undefined, { Body: parentFrame.Body }))
						attachComment(commentId)
					} else if (itemContent.includes(':')) {
						// Array item is an object starting with a key
						const colonIdx = itemContent.indexOf(':')
						const key = itemContent.substring(0, colonIdx).trim()
						const valPart = itemContent.substring(colonIdx + 1).trim()
						const obj = {}
						parentFrame.val.push(obj)
						attachComment(key)
						
						// Infer sub-Body
						let subBody = parentFrame.Body
						if (parentFrame.Body?.[key]) {
							const bp = parentFrame.Body[key]
							subBody = bp.itemType || bp.type
						}

						stack.push({ val: obj, indent, type: 'object', key, Body: parentFrame.Body })

						if (valPart === this.MULTILINE_START) {
							obj[key] = ''
							stack.push({ val: obj, indent, type: 'object', key, multiline: true, Body: subBody })
						} else if (valPart === this.EMPTY_ARRAY) {
							obj[key] = []
						} else if (valPart === this.EMPTY_OBJECT) {
							obj[key] = {}
						} else if (valPart !== '') {
							obj[key] = this.parseValue(valPart, key, { Body: subBody })
						} else {
							const subObj = {}
							obj[key] = subObj
							stack.push({ val: subObj, indent, type: 'object', key, Body: subBody })
						}
					} else if (itemContent === this.MULTILINE_START) {
						const idx = parentFrame.val.length
						parentFrame.val.push('')
						stack.push({ val: parentFrame.val, indent, type: 'array', key: idx, multiline: true, Body: parentFrame.Body })
						attachComment(commentId)
					} else if (itemContent === '') {
						const obj = {}
						const idx = parentFrame.val.length
						parentFrame.val.push(obj)
						stack.push({ val: obj, indent, type: 'object', key: idx, Body: parentFrame.Body })
						attachComment(commentId)
					} else {
						parentFrame.val.push(this.parseValue(itemContent, undefined, { Body: parentFrame.Body }))
						attachComment(commentId)
					}
				}
			}

			if (parentFrame.type === 'object') {
				// Object content
				// Object content (transition check for explicit empty collections)
				if (content === this.MULTILINE_START) {
					const grandFrame = stack[stack.length - 2]
					if (grandFrame) grandFrame.val[/** @type {string} */ (parentFrame.key)] = ''
					parentFrame.val = grandFrame ? grandFrame.val : parentFrame.val
					parentFrame.key = parentFrame.key
					parentFrame.multiline = true
					return
				}
				if (content === this.EMPTY_ARRAY || content === this.EMPTY_OBJECT) {
					const newVal = content === this.EMPTY_ARRAY ? [] : {}
					const grandFrame = stack[stack.length - 2]
					if (grandFrame) grandFrame.val[/** @type {string} */ (parentFrame.key)] = newVal
					else result = newVal
					parentFrame.val = newVal
					parentFrame.type = content === this.EMPTY_ARRAY ? 'array' : 'object'
					return
				}
				const colonIdx = content.indexOf(':')
				if (colonIdx === -1) throw new Error(`Invalid object field (no colon) at line ${lineNum}: ${content}`)
				const key = content.substring(0, colonIdx).trim()
				const valPart = content.substring(colonIdx + 1).trim()
				
				attachComment(key)

				// Infer sub-Body
				let subBody = undefined
				const bodyProp = parentFrame.Body?.[key] || (/** @type {any} */ (parentFrame.Body))?.[key]
				if (bodyProp) subBody = bodyProp.itemType || bodyProp.type

				if (valPart === this.MULTILINE_START) {
					parentFrame.val[key] = ''
					stack.push({ val: parentFrame.val, indent, type: 'object', key, multiline: true, Body: subBody })
				} else if (valPart === this.EMPTY_ARRAY) {
					parentFrame.val[key] = []
				} else if (valPart === this.EMPTY_OBJECT) {
					parentFrame.val[key] = {}
				} else if (valPart === '') {
					const obj = {}
					parentFrame.val[key] = obj
					stack.push({ val: obj, indent, type: 'object', key, Body: subBody })
				} else {
					parentFrame.val[key] = this.parseValue(valPart, key, { Body: subBody || parentFrame.Body })
				}
			}
			hasItems = true
		})

		// 4. Default result for empty input
		if (!hasItems) {
			result = result || {}
			if (bufferedComments) {
				context.comments?.push({ text: bufferedComments, id: '.' })
			}
		}

		// Post-process Body instantiation if root context.Body exists
		if (context.Body && result && typeof result === 'object' && !Array.isArray(result)) {
			const isPrimitive = [String, Number, Boolean].includes(/** @type {any} */ (context.Body))
			if (!isPrimitive) return new (/** @type {any} */ (context.Body))(result)
		}

		return result
	}

	/**
	 * Stringifies any input object or array into .NaN0 format.
	 *
	 * @param {Object|Array} input - Input object/array.
	 * @param {Context} [context={ comments: [] }]
	 * @returns {string} NaN0 formatted string.
	 *
	 * COMMENT RENDERING:
	 *   - `context.comments` is an array of `{ text, id }`.
	 *   - `id` matches either the top‑level object (`"."`) or an array index
	 *     (`"[0]"`) or a specific key.
	 *   - When a comment is present for a given path we render it as one or
	 *     multiple `#` lines placed **before** the corresponding node.
	 */
	static stringify(input, context = { comments: [] }) {
		if (input == null || (typeof input !== 'object' && !Array.isArray(input))) {
			throw new Error('NaN0.stringify requires a non-null object or array')
		}

		// Helper: render comments for a specific id/path.
		const renderComments = (path) => {
			if (!context.comments?.length) return ''
			const lines = context.comments
				.filter(({ id }) => id === path)
				.map(({ text }) =>
					text
						.split('\n')
						.map((l) => `# ${l}`)
						.join('\n'),
				)
			if (lines.length === 0) return ''
			return lines.join('\n') + '\n'
		}

		if (Array.isArray(input)) {
			const topComment = renderComments('[0]')
			const copy = [...input]
			if (copy.length === 0) {
				return topComment + this.EMPTY_ARRAY
			}
			const parent = new Node({ content: '', indent: 0 })
			copy.forEach((item) => this.addArrayItemToNode(parent, item, 0))
			const body = parent.children
				.map((c) => c.toString({ trim: false, tab: this.TAB, eol: this.NEW_LINE }))
				.join(this.NEW_LINE)
			return topComment + body
		} else {
			const copy = { ...input }
			const topComment = renderComments('.')
			if (Object.keys(copy).length === 0) {
				return topComment + this.EMPTY_OBJECT
			}
			const lines = []

			// prepend any top‑level comment
			if (topComment) lines.push(topComment.trimEnd())

			for (const [key, value] of Object.entries(copy)) {
				// comment attached to this key
				const keyComment = renderComments(key)
				if (keyComment) lines.push(keyComment.trimEnd())

				// build node for the field
				const temp = new Node({ content: '', indent: 0 })
				this.addValueToNode(temp, value, 0, key)
				const fieldStr = temp.children
					.map((c) => c.toString({ trim: false, tab: this.TAB, eol: this.NEW_LINE }))
					.join(this.NEW_LINE)
				lines.push(fieldStr)
			}
			return lines.join('\n')
		}
	}
}
