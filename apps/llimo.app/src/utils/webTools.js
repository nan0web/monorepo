import { request } from 'node:https'

/**
 * Perform a lightweight web search using DuckDuckGo HTML version.
 * @param {string} query
 * @returns {Promise<Array<{title: string, url: string, snippet: string}>>}
 */
export async function searchWeb(query) {
	return new Promise((resolve, reject) => {
		const url = new URL(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`)
		const req = request(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124 Safari/537.36',
			}
		}, (res) => {
			if (res.statusCode === 301 || res.statusCode === 302) {
				return reject(new Error(`Redirected to ${res.headers.location}`))
			}
			let html = ''
			res.on('data', d => html += d)
			res.on('end', () => {
				const results = []
				// Basic Regex parser for DDG HTML
				const resultRegex = /<a class="result__url" href="([^"]+)".*?>(.*?)<\/a>.*?<a class="result__snippet[^>]+>(.*?)<\/a>/gis
				let match
				while ((match = resultRegex.exec(html)) !== null) {
					// Clean HTML tags from snippet
					let urlStr = match[1]
					if (urlStr.startsWith('//duckduckgo.com/l/?uddg=')) {
						try { urlStr = decodeURIComponent(urlStr.split('uddg=')[1].split('&')[0]) } catch {}
					}
					results.push({
						url: urlStr,
						title: match[2].replace(/<\/?[^>]+(>|$)/g, '').trim(),
						snippet: match[3].replace(/<\/?[^>]+(>|$)/g, '').trim()
					})
				}
				resolve(results)
			})
		})
		req.on('error', reject)
		req.end()
	})
}

/**
 * Fetch and extract text from a webpage using fetch.
 * @param {string} url
 * @returns {Promise<string>}
 */
export async function readWebPage(url) {
	try {
		const res = await fetch(url, {
			headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LLiMo/1.0)' }
		})
		const html = await res.text()
		// Super basic extraction of text content without massive regex block parser
		let text = html
			.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
			.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
			.replace(/<[^>]+>/g, ' ')
			.replace(/\s+/g, ' ')
			.trim()
		return text.substring(0, 15000) // Cap to avoid massive context
	} catch (e) {
		return `Failed to read page: ${/** @type {any} */(e).message || e}`
	}
}
