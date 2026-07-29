import { LitElement, html, css } from 'lit'

export class PlayDomeCalc extends LitElement {
	static properties = {
		radius: { type: Number },
		floors: { type: Number },
		hasBasement: { type: Boolean, attribute: 'has-basement' },
	}

	static styles = css`
		:host {
			display: block;
			background: rgba(255, 255, 255, 0.02);
			backdrop-filter: blur(12px);
			border: 1px solid rgba(255, 255, 255, 0.08);
			border-radius: 16px;
			padding: 2rem;
			margin: 2rem 0;
			color: #f4f4f5;
			font-family: inherit;
		}

		.title-accent {
			background: linear-gradient(135deg, #a78bfa, #22d3ee);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			font-weight: 800;
			margin-bottom: 1.5rem;
			font-size: 1.5rem;
		}

		.layout {
			display: grid;
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		@media (min-width: 768px) {
			.layout {
				grid-template-columns: 1.2fr 1fr;
			}
		}

		.controls {
			display: flex;
			flex-direction: column;
			gap: 1.5rem;
		}

		.control-group {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
		}

		label {
			font-size: 0.9rem;
			font-weight: 600;
			color: #a1a1aa;
			display: flex;
			justify-content: space-between;
		}

		.value-badge {
			background: rgba(255, 255, 255, 0.08);
			padding: 0.1rem 0.5rem;
			border-radius: 4px;
			font-family: monospace;
			color: #22d3ee;
		}

		input[type="range"] {
			-webkit-appearance: none;
			width: 100%;
			height: 6px;
			background: rgba(255, 255, 255, 0.1);
			border-radius: 3px;
			outline: none;
		}

		input[type="range"]::-webkit-slider-thumb {
			-webkit-appearance: none;
			width: 18px;
			height: 18px;
			border-radius: 50%;
			background: #22d3ee;
			cursor: pointer;
			transition: transform 0.1s;
		}

		input[type="range"]::-webkit-slider-thumb:hover {
			transform: scale(1.15);
		}

		.checkbox-label {
			display: flex;
			align-items: center;
			gap: 0.75rem;
			cursor: pointer;
			font-weight: 600;
			color: #e4e4e7;
			user-select: none;
		}

		input[type="checkbox"] {
			width: 18px;
			height: 18px;
			accent-color: #a78bfa;
			cursor: pointer;
		}

		.preview-box {
			background: rgba(0, 0, 0, 0.2);
			border-radius: 12px;
			border: 1px solid rgba(255, 255, 255, 0.05);
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 1rem;
			min-height: 220px;
		}

		.results {
			display: flex;
			flex-direction: column;
			gap: 1.25rem;
			background: rgba(255, 255, 255, 0.03);
			border: 1px solid rgba(255, 255, 255, 0.05);
			padding: 1.5rem;
			border-radius: 12px;
		}

		.result-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid rgba(255, 255, 255, 0.05);
			padding-bottom: 0.75rem;
		}

		.result-item:last-child {
			border-bottom: none;
			padding-bottom: 0;
		}

		.result-label {
			font-size: 0.9rem;
			color: #a1a1aa;
		}

		.result-val {
			font-weight: 700;
			font-family: monospace;
			color: #f4f4f5;
			font-size: 1.05rem;
		}

		.highlight {
			color: #a78bfa;
		}

		.floor-badge {
			font-size: 0.8rem;
			background: rgba(167, 139, 250, 0.15);
			border: 1px solid rgba(167, 139, 250, 0.3);
			color: #c084fc;
			padding: 0.1rem 0.4rem;
			border-radius: 4px;
			margin-left: 0.5rem;
		}
	`

	constructor() {
		super()
		this.radius = 4.5
		this.floors = 2
		this.hasBasement = true
	}

	#calculate() {
		const r = this.radius
		const d = r * 2
		const height = r
		const domeVolume = (2 / 3) * Math.PI * Math.pow(r, 3)
		const domeSurface = 2 * Math.PI * Math.pow(r, 2)

		// Floor areas
		const floorsList = []
		for (let i = 0; i < this.floors; i++) {
			const z = 3 * i
			if (z < r) {
				const floorRadius = Math.sqrt(r * r - z * z)
				const area = Math.PI * floorRadius * floorRadius
				floorsList.push({ index: i + 1, radius: floorRadius, area })
			}
		}

		const basementArea = this.hasBasement ? Math.PI * r * r : 0
		const basementVolume = this.hasBasement ? Math.PI * r * r * 3 : 0

		const totalArea = floorsList.reduce((acc, curr) => acc + curr.area, 0) + basementArea
		const totalVolume = domeVolume + basementVolume

		return {
			d,
			height,
			domeVolume,
			domeSurface,
			floorsList,
			basementArea,
			basementVolume,
			totalArea,
			totalVolume,
		}
	}

	_updateRadius(e) {
		this.radius = parseFloat(e.target.value)
	}

	_updateFloors(e) {
		this.floors = parseInt(e.target.value, 10)
	}

	_updateBasement(e) {
		this.hasBasement = e.target.checked
	}

	render() {
		const calc = this.#calculate()

		// SVG Drawing configuration
		const svgW = 260
		const svgH = 200
		const centerX = svgW / 2
		const groundY = 120
		const scale = 80 / 6 // scale relative to 6m radius

		const domeR = calc.height * scale
		const basementH = this.hasBasement ? 3 * scale : 0

		return html`
			<h3 class="title-accent">🪐 Геодезичний Купольний Калькулятор</h3>
			
			<div class="layout">
				<div class="controls">
					<div class="control-group">
						<label>
							Радіус купола
							<span class="value-badge">${this.radius.toFixed(1)} м (Діаметр: ${(this.radius * 2).toFixed(1)} м)</span>
						</label>
						<input 
							type="range" 
							min="3" 
							max="12" 
							step="0.5" 
							.value=${this.radius} 
							@input=${this._updateRadius}
						/>
					</div>

					<div class="control-group">
						<label>
							Кількість поверхів
							<span class="value-badge">${this.floors}</span>
						</label>
						<input 
							type="range" 
							min="1" 
							max="3" 
							step="1" 
							.value=${this.floors} 
							@input=${this._updateFloors}
						/>
					</div>

					<div class="control-group" style="margin-top: 0.5rem;">
						<label class="checkbox-label">
							<input 
								type="checkbox" 
								.checked=${this.hasBasement} 
								@change=${this._updateBasement}
							/>
							Викопати яму та облаштувати підвал
						</label>
					</div>

					<div class="preview-box">
						<svg width="${svgW}" height="${svgH}" style="overflow: visible;">
							<!-- Ground level line -->
							<line x1="10" y1="${groundY}" x2="${svgW - 10}" y2="${groundY}" stroke="#4b5563" stroke-width="2" />
							
							<!-- Basement representation -->
							${this.hasBasement
								? html`
										<rect 
											x="${centerX - domeR}" 
											y="${groundY}" 
											width="${domeR * 2}" 
											height="${basementH}" 
											fill="rgba(167, 139, 250, 0.15)" 
											stroke="#a78bfa" 
											stroke-width="1.5" 
											stroke-dasharray="3,3"
										/>
										<text x="${centerX}" y="${groundY + basementH / 2 + 4}" fill="#c084fc" font-size="10" text-anchor="middle" font-family="monospace">
											Підвал (-3.0м)
										</text>
								  `
								: ''}

							<!-- Dome representation (semi-circle) -->
							<path 
								d="M ${centerX - domeR} ${groundY} A ${domeR} ${domeR} 0 0 1 ${centerX + domeR} ${groundY}" 
								fill="rgba(34, 211, 238, 0.15)" 
								stroke="#22d3ee" 
								stroke-width="2.5" 
							/>

							<!-- Floors inside dome -->
							${calc.floorsList.map((f, i) => {
								if (i === 0) return '' // Base is ground level
								const floorY = groundY - 3 * i * scale
								const floorR = f.radius * scale
								return html`
									<line 
										x1="${centerX - floorR}" 
										y1="${floorY}" 
										x2="${centerX + floorR}" 
										y2="${floorY}" 
										stroke="#22d3ee" 
										stroke-width="1" 
										stroke-dasharray="4,4" 
									/>
									<text x="${centerX}" y="${floorY - 4}" fill="#22d3ee" font-size="9" text-anchor="middle" opacity="0.8" font-family="monospace">
										Поверх ${f.index}
									</text>
								`
							})}

							<!-- Dimension annotations -->
							<line x1="${centerX}" y1="${groundY}" x2="${centerX}" y2="${groundY - domeR}" stroke="#6b7280" stroke-width="1" stroke-dasharray="2,2" />
							<text x="${centerX + 6}" y="${groundY - domeR / 2}" fill="#9ca3af" font-size="10" font-family="monospace">
								H: ${this.radius.toFixed(1)}м
							</text>
						</svg>
					</div>
				</div>

				<div class="results">
					<div class="result-item">
						<span class="result-label">Висота купола</span>
						<span class="result-val">${calc.height.toFixed(1)} м</span>
					</div>
					<div class="result-item">
						<span class="result-label">Об'єм купола (півсфера)</span>
						<span class="result-val">${calc.domeVolume.toFixed(1)} м³</span>
					</div>
					<div class="result-item">
						<span class="result-label">Площа поверхні купола</span>
						<span class="result-val">${calc.domeSurface.toFixed(1)} м²</span>
					</div>

					<div style="border-top: 1px solid rgba(255, 255, 255, 0.08); margin: 0.5rem 0;"></div>

					${calc.floorsList.map(
						(f) => html`
							<div class="result-item">
								<span class="result-label">
									Площа ${f.index}-го поверху
									<span class="floor-badge">r = ${f.radius.toFixed(1)}м</span>
								</span>
								<span class="result-val">${f.area.toFixed(1)} м²</span>
							</div>
						`,
					)}

					${this.hasBasement
						? html`
								<div class="result-item">
									<span class="result-label">Площа підвалу</span>
									<span class="result-val">${calc.basementArea.toFixed(1)} м²</span>
								</div>
								<div class="result-item">
									<span class="result-label">Об'єм підвалу</span>
									<span class="result-val">${calc.basementVolume.toFixed(1)} м³</span>
								</div>
						  `
						: ''}

					<div style="border-top: 1px solid rgba(255, 255, 255, 0.08); margin: 0.5rem 0;"></div>

					<div class="result-item">
						<span class="result-label" style="font-weight: bold; color: #e4e4e7;">Загальна площа поверхів</span>
						<span class="result-val highlight">${calc.totalArea.toFixed(1)} м²</span>
					</div>
					<div class="result-item">
						<span class="result-label" style="font-weight: bold; color: #e4e4e7;">Загальний об'єм</span>
						<span class="result-val highlight">${calc.totalVolume.toFixed(1)} м³</span>
					</div>
				</div>
			</div>
		`;
	}
}

customElements.define('play-domecalc', PlayDomeCalc)
