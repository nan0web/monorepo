import { LitElement, html, css } from 'lit'
import { icon } from '@nan0web/icons/adapters/lit'
import {
	BsPlayFill,
	BsCheckCircleFill,
	BsArrowRepeat,
	BsGear,
	BsFolder,
	BsShieldLock,
	BsCloud,
	BsLaptop
} from '@nan0web/icons/bs'
import {
	TrendAnalyzer,
	ShortsGenerator,
	VideoCompiler,
	evaluateRules,
	parseDelay
} from '@nan0web/share.app'

/**
 * ShareWeb — Unified Web UI for the @nan0web/share.app media pipeline.
 * Exposes research, generation, and distribution workflows in a responsive, rich glassmorphic interface.
 */
export class ShareWeb extends LitElement {
	static properties = {
		model: { type: Object },
		_logs: { type: Array, state: true },
		_loading: { type: Boolean, state: true },
		_trends: { type: Array, state: true },
		_rulesContent: { type: Object, state: true },
		_rulesOutput: { type: Array, state: true }
	}

	static styles = css`
		:host {
			display: block;
			font-family: 'Outfit', sans-serif;
			color: #e4e4e7;
			background: radial-gradient(circle at top left, #18181b, #09090b);
			padding: 2rem;
			border-radius: 16px;
			border: 1px solid rgba(255, 255, 255, 0.08);
			max-width: 1200px;
			margin: 2rem auto;
			box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
			backdrop-filter: blur(12px);
		}

		.title-area {
			display: flex;
			align-items: center;
			justify-content: space-between;
			border-bottom: 1px solid rgba(255, 255, 255, 0.1);
			padding-bottom: 1.5rem;
			margin-bottom: 2rem;
		}

		.title-area h1 {
			margin: 0;
			font-size: 2rem;
			font-weight: 600;
			background: linear-gradient(to right, #a78bfa, #818cf8, #60a5fa);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
		}

		.badge {
			background: rgba(139, 92, 246, 0.15);
			border: 1px solid rgba(139, 92, 246, 0.3);
			color: #c084fc;
			padding: 0.3rem 0.8rem;
			border-radius: 9999px;
			font-size: 0.8rem;
			font-weight: 600;
			letter-spacing: 0.05em;
		}

		.grid {
			display: grid;
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		@media (min-width: 768px) {
			.grid {
				grid-template-columns: 1fr 1fr;
			}
		}

		.card {
			background: rgba(255, 255, 255, 0.03);
			border: 1px solid rgba(255, 255, 255, 0.06);
			border-radius: 12px;
			padding: 1.5rem;
			transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		}

		.card:hover {
			border-color: rgba(139, 92, 246, 0.3);
			background: rgba(255, 255, 255, 0.05);
			transform: translateY(-2px);
		}

		.card h2 {
			margin-top: 0;
			font-size: 1.25rem;
			color: #f4f4f5;
			display: flex;
			align-items: center;
			gap: 0.6rem;
		}

		.card p {
			color: #a1a1aa;
			font-size: 0.9rem;
			line-height: 1.5;
		}

		.btn {
			background: linear-gradient(135deg, #7c3aed, #4f46e5);
			color: white;
			border: none;
			padding: 0.6rem 1.2rem;
			border-radius: 8px;
			font-weight: 600;
			cursor: pointer;
			display: inline-flex;
			align-items: center;
			gap: 0.5rem;
			transition: all 0.2s ease;
			box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
		}

		.btn:hover {
			opacity: 0.9;
			transform: scale(1.02);
		}

		.btn:disabled {
			opacity: 0.5;
			cursor: not-allowed;
			transform: none;
		}

		.btn-secondary {
			background: rgba(255, 255, 255, 0.08);
			border: 1px solid rgba(255, 255, 255, 0.1);
			color: #e4e4e7;
			box-shadow: none;
		}

		.btn-secondary:hover {
			background: rgba(255, 255, 255, 0.12);
		}

		.trends-list {
			margin-top: 1rem;
			display: flex;
			flex-wrap: wrap;
			gap: 0.5rem;
		}

		.trend-tag {
			background: rgba(96, 165, 250, 0.1);
			border: 1px solid rgba(96, 165, 250, 0.2);
			color: #93c5fd;
			padding: 0.25rem 0.6rem;
			border-radius: 6px;
			font-size: 0.8rem;
		}

		.console {
			background: #09090b;
			border: 1px solid rgba(255, 255, 255, 0.1);
			border-radius: 8px;
			font-family: 'JetBrains Mono', monospace;
			padding: 1rem;
			font-size: 0.85rem;
			height: 180px;
			overflow-y: auto;
			color: #34d399;
			margin-top: 2rem;
		}

		.console-line {
			margin-bottom: 0.4rem;
			display: flex;
			gap: 0.5rem;
		}

		.console-ts {
			color: #71717a;
		}

		.rules-form {
			display: flex;
			flex-direction: column;
			gap: 0.8rem;
			margin-top: 1rem;
		}

		.input-group {
			display: flex;
			flex-direction: column;
			gap: 0.4rem;
		}

		.input-group label {
			font-size: 0.8rem;
			color: #a1a1aa;
		}

		.input-group input, .input-group textarea {
			background: rgba(0, 0, 0, 0.2);
			border: 1px solid rgba(255, 255, 255, 0.1);
			padding: 0.5rem;
			border-radius: 6px;
			color: #f4f4f5;
			font-family: inherit;
			font-size: 0.9rem;
		}

		.input-group input:focus, .input-group textarea:focus {
			outline: none;
			border-color: #8b5cf6;
		}
	`;

	constructor() {
		super()
		this._logs = []
		this._loading = false
		this._trends = []
		this._rulesContent = {
			text: 'Нова декларація цифрового суверенітету NaN•Web.',
			tags: 'public, sovereign',
			type: 'post',
			lang: 'uk'
		}
		this._rulesOutput = []
	}

	connectedCallback() {
		super.connectedCallback()
		this.log('ShareApp Web Interface loaded successfully.')
	}

	log(msg) {
		const ts = new Date().toLocaleTimeString()
		this._logs = [...this._logs, { ts, text: msg }]
		// Auto scroll console
		setTimeout(() => {
			const consoleEl = this.shadowRoot.querySelector('.console')
			if (consoleEl) {
				consoleEl.scrollTop = consoleEl.scrollHeight
			}
		}, 10)
	}

	async runTrendAnalysis() {
		this._loading = true
		this.log('Starting Trend Analysis...')
		try {
			const analyzer = new TrendAnalyzer()
			const res = await analyzer.compileDigest()
			if (res.ok) {
				this._trends = res.digest
				this.log(`Successfully compiled trends: ${res.digest.join(', ')}`)
			} else {
				this.log(`Analysis returned status: ${res.code}`)
			}
		} catch (err) {
			this.log(`Error running trend analysis: ${err.message}`)
		} finally {
			this._loading = false
		}
	}

	async compileVideo() {
		this._loading = true
		this.log('Compiling video timeline from configurations...')
		try {
			const compiler = new VideoCompiler()
			const res = await compiler.compile('vlog/season_1/constitution.yaml')
			if (res.ok) {
				this.log(`Video compiled successfully. Output: ${res.outputPath}`)
			} else {
				this.log(`Compilation failed: ${res.errors.join('; ')}`)
			}
		} catch (err) {
			this.log(`Error compiling video: ${err.message}`)
		} finally {
			this._loading = false
		}
	}

	async generateShorts() {
		this._loading = true
		this.log('Starting automated Shorts splitting process...')
		try {
			const generator = new ShortsGenerator()
			const res = await generator.split('vlog/season_1/shorts.yaml')
			if (res.ok) {
				this.log(`Generated ${res.count} short vertical videos.`)
				
				this.log('Embedding thumbnail overlay for the final second of vertical videos...')
				const thumbRes = await generator.embedThumbnail('vlog/season_1/short_1.mp4', 'media/thumb_1.jpg')
				if (thumbRes.ok) {
					this.log(`Embedded thumbnail successfully. Output file: ${thumbRes.outputPath}`)
				}
			} else {
				this.log(`Shorts generation failed: ${res.errors.join('; ')}`)
			}
		} catch (err) {
			this.log(`Error: ${err.message}`)
		} finally {
			this._loading = false
		}
	}

	evaluateRuleset() {
		this.log('Evaluating content tags against publication ruleset...')
		const tagsArr = this._rulesContent.tags.split(',').map(t => t.trim()).filter(Boolean)
		const content = {
			text: this._rulesContent.text,
			tags: tagsArr,
			type: this._rulesContent.type,
			lang: this._rulesContent.lang
		}

		const dummy = { id: 'dummy', config: { account: 'sovereign-rasta' } }
		const adapters = new Map([['dummy', dummy]])

		const rules = [
			{
				name: 'Public Ukrainian Posts',
				if: { tags: ['public'], lang: 'uk' },
				publish: [{ adapter: 'dummy', delay: '15m' }]
			},
			{
				name: 'Sovereign Declarations',
				if: { tags: ['sovereign'] },
				publish: [{ adapter: 'dummy', delay: '1h' }]
			}
		]

		try {
			const tasks = evaluateRules(content, rules, adapters)
			this._rulesOutput = tasks
			this.log(`Rules evaluation completed. Generated ${tasks.length} tasks.`)
		} catch (err) {
			this.log(`Evaluation error: ${err.message}`)
		}
	}

	render() {
		return html`
			<div class="title-area">
				<div>
					<h1>ShareApp</h1>
					<p style="margin: 0.5rem 0 0 0; color: #a1a1aa;">Sovereign Media Pipeline & Social Distribution Dashboard</p>
				</div>
				<span class="badge">V3.2.0 PRODUCTION-GRADE</span>
			</div>

			<div class="grid">
				<!-- Research Card -->
				<div class="card">
					<h2>Research Domain</h2>
					<p>Analyze trends across Google, YouTube, and RSS feeds to find evergreen keywords and relevant metadata hashtags.</p>
					<button class="btn" ?disabled=${this._loading} @click=${this.runTrendAnalysis}>
						${icon(BsArrowRepeat, { size: 16 })} Run Trend Analyzer
					</button>
					${this._trends.length > 0 ? html`
						<div class="trends-list">
							${this._trends.map(t => html`<span class="trend-tag">${t}</span>`)}
						</div>
					` : ''}
				</div>

				<!-- Generation Card -->
				<div class="card">
					<h2>Generation Domain</h2>
					<p>Compile target vlog episodes, split vertical Shorts, and embed dynamic end-screen overlay thumbnails.</p>
					<div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
						<button class="btn" ?disabled=${this._loading} @click=${this.compileVideo}>
							Compile Video
						</button>
						<button class="btn btn-secondary" ?disabled=${this._loading} @click=${this.generateShorts}>
							Generate Shorts
						</button>
					</div>
				</div>

				<!-- Distribution Rules Evaluator -->
				<div class="card" style="grid-column: span 1;">
					<h2>Distribution Domain (Rules Evaluator)</h2>
					<p>Test the declarative publication schedule against your content tags. Delay formulas support intervals (e.g. 15m, 1d 09:00).</p>
					
					<div class="rules-form">
						<div class="input-group">
							<label>Content Text</label>
							<input type="text" .value=${this._rulesContent.text} @input=${(e) => this._rulesContent = { ...this._rulesContent, text: e.target.value }}>
						</div>
						<div class="input-group">
							<label>Tags (comma separated)</label>
							<input type="text" .value=${this._rulesContent.tags} @input=${(e) => this._rulesContent = { ...this._rulesContent, tags: e.target.value }}>
						</div>
						<button class="btn" @click=${this.evaluateRuleset}>Evaluate Rules</button>
					</div>
				</div>

				<!-- Rules Execution Output -->
				<div class="card">
					<h2>Calculated Schedule Tasks</h2>
					${this._rulesOutput.length === 0 ? html`
						<p style="color: #71717a; font-style: italic;">No tasks generated yet. Try evaluating rules.</p>
					` : html`
						<div style="display: flex; flex-direction: column; gap: 0.8rem; margin-top: 1rem;">
							${this._rulesOutput.map(task => html`
								<div style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.06); padding: 0.8rem; border-radius: 6px;">
									<div style="font-weight: 600; color: #a78bfa;">Rule: "${task.ruleName}"</div>
									<div style="font-size: 0.85rem; color: #a1a1aa; margin-top: 0.2rem;">
										Target: ${task.adapter.id} (Account: ${task.adapter.config.account})
									</div>
									<div style="font-size: 0.85rem; color: #34d399; margin-top: 0.2rem;">
										Delay: ${task.delayMs}ms (~${Math.round(task.delayMs / 60000)}m)
									</div>
								</div>
							`)}
						</div>
					`}
				</div>
			</div>

			<!-- Logs Console -->
			<div class="console">
				${this._logs.map(log => html`
					<div class="console-line">
						<span class="console-ts">[${log.ts}]</span>
						<span>${log.text}</span>
					</div>
				`)}
			</div>
		`
	}
}

customElements.define('share-web', ShareWeb)
