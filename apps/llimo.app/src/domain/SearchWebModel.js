import { AI } from '@nan0web/ai'
import { Model } from '@nan0web/types'
import { searchWeb, readWebPage } from '../utils/webTools.js'

/**
 * llimo search — A research agent that performs a web search, reads the top 3 results, and compiles an answer.
 *
 * @property {string} query Search query to investigate
 * @property {boolean} quiet Quiet mode
 */
export class SearchWebModel extends Model {
	/**
	 * @param {Partial<SearchWebModel> | Record<string, any>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions> & { db?: any, ai?: any }} [options]
	 */
	constructor(data = {}, options = /** @type {any} */ ({})) {
		super(data, options)
		/** @type {any} Search query to investigate */ this.query
		/** @type {boolean} Quiet mode */ this.quiet
	}



	static query = {
		help: 'Search query to investigate',
		default: '',
		positional: true,
	}

	static quiet = {
		help: 'Quiet mode',
		default: false,
		type: 'boolean',
		alias: 'q',
	}

	async *run() {
		if (!this.query) {
			yield { type: 'log', level: 'error', message: 'Missing search query.' }
			return { success: false }
		}

		yield { type: 'progress', message: `🔍 Searching web for: "${this.query}"...` }
		
		const results = await searchWeb(this.query)
		if (!results || results.length === 0) {
			yield { type: 'log', level: 'warning', message: 'No search results found.' }
			return { success: false }
		}

		const topResults = results.slice(0, 3)
		yield { type: 'log', level: 'info', message: `Found ${results.length} results. Reading top ${topResults.length} pages...` }

		const pages = []
		for (const res of topResults) {
			yield { type: 'progress', message: `Reading: ${res.title}...` }
			const content = await readWebPage(res.url)
			pages.push({ title: res.title, url: res.url, content })
		}

		yield { type: 'progress', message: '🧠 Compiling answer with AI...' }

		const ai = /** @type {any} */ (this._)?.ai || new AI({ strategy: new AI.Strategy({ level: 'smart' }) })
		await ai.refreshModels()
		const estimatedTokens = 4000
		const bestModel = ai.strategy.findModel(ai.getModelsMap(), estimatedTokens, estimatedTokens + 5000) || ai.getModels()[0]

		const systemPrompt = `You are a research assistant. Based on the following Web Search Context, provide a comprehensive, well-structured answer in Markdown format. Cite your sources using [1], [2], etc., linking to the provided URLs. Focus on accuracy.
		
Context:
${pages.map((p, i) => `[${i + 1}] Title: ${p.title}\nURL: ${p.url}\nContent: ${p.content.substring(0, 4000)}`).join('\n\n')}
`

		const messages = [
			{ role: 'system', content: systemPrompt },
			{ role: 'user', content: this.query }
		]

		const { text } = await ai.generateText(bestModel, messages)
		yield { type: 'result', data: text }
		
		return { success: true }
	}
}
