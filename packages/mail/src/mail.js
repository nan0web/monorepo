import HTMLTransformer, { escape } from '@nan0web/html'
import { replace } from './placeholders.js'
import { Data } from '@nan0web/db'
import Email from './Email.js'

/**
 * @param {string} html
 * @returns {string}
 */
function html2text(html) {
	// Remove script and style tags and their content
	html = String(html).replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
	html = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')

	// Replace line breaks with space for better formatting
	html = html.replace(/<br\s*\/?>/gi, '\n')

	// Replace paragraphs with line breaks
	html = html.replace(/<\/p>/gi, '\n')

	// Remove all other HTML tags
	html = html.replace(/<[^>]+>/g, '')

	// Decode HTML entities (e.g., &amp; -> &, &lt; -> <, etc.)
	html = html.replace(/&nbsp;/gi, ' ')
	html = html.replace(/&amp;/gi, '&')
	html = html.replace(/&quot;/gi, '"')
	html = html.replace(/&lt;/gi, '<')
	html = html.replace(/&gt;/gi, '>')
	html = html.replace(/&#39;/gi, "'")

	// Trim any extra spaces or newlines
	return html.trim()
}

/**
 *
 * @param {Email} email
 * @param {object} data
 * @param {object} opts The options
 */
const mail = async (email, data, opts = { mailer: null, htmlEol: null, onError: false }) => {
	const mailer = opts.mailer || global.mailer || null
	const htmlEol = 'string' === typeof opts.htmlEol ? opts.htmlEol : '\n'
	const onError = opts.onError || null
	// Flatten the data object
	const flat = Data.flatten(data)
	const env = email.formatForNodemailer(flat, replace)
	const subject = env.subject
	const attachments = env.attachments
	const from = data.from || email.from || null
	const target = data.target || email.target || null
	const transformer = new HTMLTransformer()
	const rendered =
		'string' === typeof email.html ? email.html : await transformer.encode(email.html)
	const content = replace(rendered, flat, escape)
	const text = replace(email.text ? email.text : html2text(content), flat)
	const style = email.style ? `<style>${email.style}</style>` : ''
	// Convert nano-formatted HTML into valid HTML with replaced placeholders
	const html = [
		'<!DOCTYPE html>',
		'<html>',
		'<head>',
		'<title>' + escape(subject) + '</title>',
		style,
		'</head>',
		'<body>',
		content,
		'</body>',
		'</html>',
	].join(htmlEol)

	// Send email
	try {
		const info = await mailer.sendMail({
			...target.formatForNodemailer(),
			from,
			subject,
			text,
			html,
			attachments,
		})
		return info
	} catch (err) {
		if (onError) {
			onError(err)
			return false
		} else {
			throw err
		}
	}
}

export default mail
