import { ModelAsApp } from '@nan0web/ui-cli'
import { AI } from '@nan0web/ai'
import { ToolChecker } from '../ToolChecker.js'

/**
 * @typedef {object} ScriptGenerateCommandOptions
 * @property {string} topic - Topic or idea for the script.
 * @property {string} [style] - Writing style template (storytelling|educational|promotional|hook).
 * @property {string} [language] - Language code (uk|en|auto).
 * @property {string} [output] - Output file path for the script.
 * @property {number} [duration] - Target video duration in seconds (default: 60).
 * @property {string} [platform] - Target platform (youtube|tiktok|instagram|linkedin).
 */

export class ScriptGenerateCommand extends ModelAsApp {
	static alias = 'generate:script'

	static topic = {
		type: 'string',
		required: true,
		help: 'Topic, idea, or short description for the script',
	}

	static style = {
		type: 'string',
		required: false,
		help: 'Writing style template: storytelling|educational|promotional|hook|article (default: storytelling)',
	}

	static language = {
		type: 'string',
		required: false,
		help: 'Language code: uk|en|auto (default: auto)',
	}

	static output = {
		type: 'string',
		required: false,
		help: 'Output file path for the generated script',
	}

	static duration = {
		type: 'number',
		required: false,
		default: 60,
		help: 'Target video duration in seconds (default: 60)',
	}

	static platform = {
		type: 'string',
		required: false,
		help: 'Target platform: youtube|tiktok|instagram|linkedin',
	}

	/**
	 * @param {ScriptGenerateCommandOptions} data
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
	}

	/** Built-in style templates */
	static STYLES = {
		storytelling: {
			name: 'Storytelling',
			instructions: `Write a compelling narrative with a clear hook, rising tension, and a satisfying resolution. Use vivid imagery and emotional beats. Structure:
- Hook (first 3-5 seconds): grab attention with a provocative statement or question
- Context: establish the setting and stakes
- Conflict/Tension: present the problem or challenge
- Resolution: deliver the insight or payoff
- CTA: call to action (subscribe, comment, share)`,
		},
		educational: {
			name: 'Educational',
			instructions: `Write a clear, structured lesson that teaches a specific concept or skill. Use analogies and examples. Structure:
- Hook: state what the viewer will learn and why it matters
- Core concept: explain the idea in simple terms
- Example: demonstrate with a real-world case
- Deeper insight: add nuance or counter-intuitive angle
- Summary: recap key takeaways
- CTA: encourage engagement`,
		},
		promotional: {
			name: 'Promotional',
			instructions: `Write a persuasive pitch that highlights value and urgency. Focus on benefits, not features. Structure:
- Hook: name the pain point or desire
- Solution: introduce the product/service/idea as the answer
- Proof: social proof, stats, or demonstration
- Objection handling: address the "but..." in viewer's mind
- CTA: clear, urgent, specific call to action`,
		},
		hook: {
			name: 'Hook-Oriented',
			instructions: `Write an ultra-short, high-retention script optimized for Shorts/Reels. Every second must earn its place. Structure:
- Hook (0-3s): pattern interrupt — unexpected statement, question, or visual
- Body (3-25s): rapid-fire value, one idea per sentence
- Cliffhanger or twist (last 3s): unexpected conclusion
- CTA: "Follow for more" or "Comment your take"`,
		},
		article: {
			name: 'Article / Blog Post',
			instructions: `Write a structured long-form article with SEO optimization, headings, and metadata. Structure:
- Title: SEO-optimized, clickable headline
- Meta description: 150-160 characters
- Introduction: state the problem and promise the solution
- Sections: 3-5 H2 sections with H3 subsections
- Conclusion: summary + CTA
- Tags: 5-10 relevant keywords`,
		},
	}

	/**
	 * @param {string} styleName
	 * @returns {string}
	 */
	static _resolveStyle(styleName) {
		const style = this.STYLES[styleName]
		return style ? style.instructions : this.STYLES.storytelling.instructions
	}

	/**
	 * @param {string} platform
	 * @returns {string}
	 */
	static _platformTip(platform) {
		const tips = {
			youtube: 'Optimize for search (SEO title, description with keywords, chapters/timestamps). Aim for 8-15 minutes for long-form.',
			tiktok: 'Fast pacing, vertical format, trend-aware. First 2 seconds must hook. Keep under 60 seconds.',
			instagram: 'Polished aesthetic, lifestyle tone. Reels up to 90s. Use trending audio references.',
			linkedin: 'Professional, authoritative tone. Long-form posts with line breaks. Lead with insight, not clickbait.',
		}
		return tips[platform] || ''
	}

	async *run() {
		if (!this.topic) {
			yield { type: 'log', level: 'error', message: 'Topic is required.' }
			return { type: 'result', data: { success: false, message: 'Topic required' } }
		}

		const styleName = this.style || 'storytelling'
		const styleInstructions = ScriptGenerateCommand._resolveStyle(styleName)
		const platformTip = ScriptGenerateCommand._platformTip(this.platform || '')

		const lang = this.language || 'auto'
		const langInstruction = lang === 'auto'
			? 'Auto-detect the language from the topic. Use UKRAINIAN by default if uncertain.'
			: `Write the script in ${lang === 'uk' ? 'Ukrainian' : lang === 'en' ? 'English' : lang.toUpperCase()} language.`

		const duration = this.duration || 60
		const wordCount = Math.round(duration * 2.5) // ~2.5 words per second for speech
		const platformInfo = platformTip ? `\nTarget platform: ${this.platform}\n${platformTip}` : ''

		const prompt = `You are a professional scriptwriter for video content.

${langInstruction}
${platformInfo}

Style: ${styleName}
Target duration: ${duration} seconds (~${wordCount} words)

Style instructions:
${styleInstructions}

TOPIC: ${this.topic}

Write ONLY the script content. No meta-commentary, no "Here is your script". 
For video scripts, include [VISUAL] cues in brackets. For articles, include proper Markdown formatting.

Output format preference: plain text with clear section breaks.`

		yield {
			type: 'progress',
			message: `Generating ${styleName} script for "${this.topic.substring(0, 60)}..." (${lang})`,
		}

		try {
			const ai = new AI({}, this._)
			const model = ai.findModel('mistral') || ai.findModel('cerebras') || ai.findModel('openai')
			if (!model) {
				// Fallback: use any available model
				const models = ai.getModels()
				if (models.length === 0) {
					throw new Error('No AI models available. Configure API keys (MISTRAL_API_KEY, CEREBRAS_API_KEY, etc.)')
				}
			}

			const result = await ai.generateText(model || ai.getModels()[0], [
				{ role: 'user', content: prompt },
			])

			const script = result.text

			// Save or print
			const db = this._.db
			if (this.output) {
				await db.saveFile(`@app/${this.output}`, script)
				yield { type: 'log', level: 'info', message: `\nScript saved to: ${this.output}` }
			} else {
				yield { type: 'log', level: 'info', message: '' }
				yield { type: 'log', level: 'info', message: `\n─── Script (${styleName}) ───` }
				yield { type: 'log', level: 'info', message: script }
				yield { type: 'log', level: 'info', message: `──────────────────────────` }
			}

			return {
				type: 'result',
				data: {
					success: true,
					script,
					style: styleName,
					language: lang,
					platform: this.platform || null,
					duration,
					outputPath: this.output || null,
				},
			}
		} catch (err) {
			yield { type: 'log', level: 'error', message: `Script generation failed: ${err.message}` }
			return { type: 'result', data: { success: false, message: err.message } }
		}
	}
}