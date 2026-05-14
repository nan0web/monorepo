import React, { useState, useMemo, useEffect, useRef } from 'react'

/**
 * Утиліта: вичитує всі static поля з класу-схеми (Model as Schema).
 */
function extractFields(StylesClass) {
	const fields = []
	const instance = new StylesClass()
	for (const key of Object.keys(instance)) {
		const meta = StylesClass[key]
		if (meta && meta.alias) fields.push({ key, meta })
	}
	return fields
}

/** Парсить значення з одиницею: '0.9rem' → { num: 0.9, unit: 'rem' } */
function parseSize(value) {
	const match = String(value).match(/^([0-9]*\.?[0-9]+)\s*(rem|px|em|%|vh|vw)?$/)
	if (match) return { num: parseFloat(match[1]), unit: match[2] || 'px' }
	return { num: 0, unit: 'px' }
}

/** Розбирає рядок тіні на компоненти X, Y, Blur, Spread, Color */
function parseShadow(value) {
	const str = String(value).trim()
	if (str === 'none' || !str) return { x: 0, y: 0, blur: 0, spread: null, color: '#000000' }

	const colorMatch = str.match(/(rgba?\([^)]+\)|hsla?\([^)]+\)|#[0-9a-fA-F]+|[a-z]+)$/i)
	const color = colorMatch ? colorMatch[0] : '#000000'

	const coordsStr = str.replace(color, '').trim()
	const coords = coordsStr.split(/\s+/)

	return {
		x: parseFloat(coords[0]) || 0,
		y: parseFloat(coords[1]) || 0,
		blur: parseFloat(coords[2]) || 0,
		spread: coords.length > 3 ? parseFloat(coords[3]) : null,
		color: color,
	}
}

/** Перетворює значення поля у CSS-змінну. */
function toCssValue(value, meta) {
	if (typeof meta.default === 'boolean') return value ? 'normal' : 'nowrap'
	return String(value)
}

/** Визначає тип UI контролу. */
function inferControlType(meta) {
	if (meta.control) return meta.control
	if (typeof meta.default === 'boolean') return 'switch'
	if (meta.units) return 'size'
	if (meta.options) return 'select'
	if (
		typeof meta.default === 'string' &&
		/^(?:\d*\.?\d+[a-z%]+(?:\s+)?){1,4}$/i.test(meta.default.trim()) &&
		!meta.isColor
	)
		return 'spacing'
	if (
		typeof meta.default === 'string' &&
		(/^#[0-9a-fA-F]{3,8}$/i.test(meta.default) ||
			/^rgba?\(/i.test(meta.default) ||
			/^hsla?\(/i.test(meta.default) ||
			meta.isColor)
	)
		return 'color'
	if (typeof meta.default === 'number') return 'number'
	return 'text'
}

/** Групує поля за секціями (визначаються з alias-префіксу). */
function groupFields(fields) {
	const groups = new Map()
	for (const f of fields) {
		const alias = f.meta.alias
		let section
		if (alias.includes('dropdown') || alias.includes('3rd-level'))
			section = '🔽 Dropdown (Рівень 3+)'
		else if (
			alias.includes('subnav') ||
			alias.includes('1st-level-subnav') ||
			alias.includes('2nd-level')
		)
			section = '🟦 Смуга підменю (Рівень 2)'
		else if (alias.includes('lang')) section = '🌐 Мовний перемикач'
		else if (alias.includes('btn')) section = '🔘 Кнопка входу'
		else if (
			alias.includes('nav-link') ||
			alias.includes('caret') ||
			alias.includes('active') ||
			alias.includes('1st-level-wrap')
		)
			section = '📌 Головне меню (Рівень 1)'
		else section = '🏛 Загальне'
		if (!groups.has(section)) groups.set(section, [])
		groups.get(section).push(f)
	}
	return groups
}

// ═══════════════════════════════════════════════════════════
// Контролі
// ═══════════════════════════════════════════════════════════

function SizeControl({ id, meta, value, onChange }) {
	const parsed = parseSize(value)
	const [num, setNum] = useState(parsed.num)
	const [unit, setUnit] = useState(parsed.unit)

	useEffect(() => {
		const p = parseSize(value)
		setNum(p.num)
		setUnit(p.unit)
	}, [value])

	const handleNum = (n) => {
		setNum(n)
		onChange(`${n}${unit}`)
	}
	const handleUnit = (u) => {
		setUnit(u)
		onChange(`${num}${u}`)
	}

	return (
		<div className="d-flex align-items-center gap-2 w-100">
			<label
				className="small text-body mb-0 user-select-none text-truncate flex-shrink-0"
				htmlFor={id}
				title={`--${meta.alias}`}
				style={{ width: '110px', cursor: 'pointer' }}
			>
				{meta.help}
			</label>
			<input
				type="range"
				className="form-range flex-grow-1"
				id={id}
				min={meta.min}
				max={meta.max}
				step={meta.step}
				value={num}
				onChange={(e) => handleNum(parseFloat(e.target.value))}
				style={{ minWidth: '40px' }}
			/>
			<span
				className="font-monospace small text-body-secondary flex-shrink-0"
				style={{ width: '38px', textAlign: 'right' }}
			>
				{num}
			</span>
			<select
				className="form-select form-select-sm flex-shrink-0 py-0"
				value={unit}
				onChange={(e) => handleUnit(e.target.value)}
				style={{ width: '55px', fontSize: '0.75rem', minHeight: '24px' }}
			>
				{meta.units.map((u) => (
					<option key={u} value={u}>
						{u}
					</option>
				))}
			</select>
		</div>
	)
}

function SelectControl({ id, meta, value, onChange }) {
	const hasCustom = meta.options.includes('=')
	const isCustom = hasCustom && !meta.options.filter((o) => o !== '=').includes(String(value))
	const [customMode, setCustomMode] = useState(isCustom)
	const [customNum, setCustomNum] = useState(
		typeof meta.default === 'number' ? Number(value) || meta.default : meta.min || 100,
	)

	useEffect(() => {
		const isC = hasCustom && !meta.options.filter((o) => o !== '=').includes(String(value))
		setCustomMode(isC)
		if (isC) setCustomNum(Number(value) || meta.min || 100)
	}, [value])

	const handleSelect = (v) => {
		if (v === '=') {
			setCustomMode(true)
			onChange(customNum)
		} else {
			setCustomMode(false)
			onChange(v)
		}
	}
	const handleSlider = (n) => {
		setCustomNum(n)
		onChange(n)
	}

	return (
		<div className="d-flex flex-column gap-1 w-100">
			<label
				className="small text-body mb-0 user-select-none text-truncate"
				htmlFor={id}
				title={`--${meta.alias}`}
				style={{ width: '100%', cursor: 'pointer' }}
			>
				{meta.help}
			</label>
			<div className="d-flex align-items-center gap-2 w-100">
				<select
					className="form-select form-select-sm flex-shrink-0 py-0"
					id={id}
					value={customMode ? '=' : String(value)}
					onChange={(e) => handleSelect(e.target.value)}
					style={{
						width: customMode ? '70px' : '100%',
						fontSize: '0.75rem',
						minHeight: '24px',
					}}
				>
					{meta.options.map((opt) => (
						<option key={opt} value={opt}>
							{opt === '=' ? 'Число' : opt}
						</option>
					))}
				</select>
				{customMode && meta.min != null && (
					<>
						<input
							type="range"
							className="form-range flex-grow-1"
							min={meta.min}
							max={meta.max}
							step={meta.step}
							value={customNum}
							onChange={(e) => handleSlider(Number(e.target.value))}
							style={{ minWidth: '30px' }}
						/>
						<span
							className="font-monospace small text-body-secondary flex-shrink-0"
							style={{ width: '32px', textAlign: 'right' }}
						>
							{customNum}
						</span>
					</>
				)}
			</div>
		</div>
	)
}

// ═══════════════════════════════════════════════════════════
// Контроль: Відступи (Spacing: Margin/Padding)
// ═══════════════════════════════════════════════════════════

function parseSpacing(value) {
	const parts = String(value).trim().split(/\s+/)
	let top = '0px',
		right = '0px',
		bottom = '0px',
		left = '0px'
	if (parts.length === 1) {
		top = right = bottom = left = parts[0]
	} else if (parts.length === 2) {
		top = bottom = parts[0]
		right = left = parts[1]
	} else if (parts.length === 3) {
		top = parts[0]
		right = left = parts[1]
		bottom = parts[2]
	} else if (parts.length >= 4) {
		top = parts[0]
		right = parts[1]
		bottom = parts[2]
		left = parts[3]
	}

	const parseVal = (v) => {
		const match = v.match(/^([0-9]*\.?[0-9]+)([a-z%]+)?$/)
		return match ? { num: parseFloat(match[1]), unit: match[2] || 'px' } : { num: 0, unit: 'px' }
	}
	return { t: parseVal(top), r: parseVal(right), b: parseVal(bottom), l: parseVal(left) }
}

const SPACING_UNITS = ['rem', 'px', 'em', '%']

function SpacingControl({ id, meta, value, onChange }) {
	const initValues = parseSpacing(value)
	const isAllEqual =
		initValues.t.num === initValues.r.num &&
		initValues.r.num === initValues.b.num &&
		initValues.b.num === initValues.l.num

	const [linked, setLinked] = useState(isAllEqual)
	const [vals, setVals] = useState(initValues)

	useEffect(() => {
		const parsed = parseSpacing(value)
		setVals(parsed)
		const eq =
			parsed.t.num === parsed.r.num &&
			parsed.r.num === parsed.b.num &&
			parsed.b.num === parsed.l.num
		setLinked(eq)
	}, [value])

	const handleUpdate = (side, num, unit) => {
		let newVals = { ...vals, [side]: { num, unit } }
		if (linked) {
			newVals = { t: { num, unit }, r: { num, unit }, b: { num, unit }, l: { num, unit } }
		}
		setVals(newVals)

		if (linked) {
			onChange(`${newVals.t.num}${newVals.t.unit}`)
		} else {
			onChange(
				`${newVals.t.num}${newVals.t.unit} ${newVals.r.num}${newVals.r.unit} ${newVals.b.num}${newVals.b.unit} ${newVals.l.num}${newVals.l.unit}`,
			)
		}
	}

	const InputSide = ({ label, side }) => (
		<div className="input-group input-group-sm flex-grow-1" title={label}>
			<span className="input-group-text px-1 py-0 text-muted" style={{ fontSize: '0.65rem' }}>
				{label}
			</span>
			<input
				type="number"
				className="form-control px-1 py-0 text-center font-monospace"
				value={vals[side].num}
				onChange={(e) => handleUpdate(side, Number(e.target.value), vals[side].unit)}
				style={{ fontSize: '0.75rem', minHeight: '22px', minWidth: '35px' }}
				step="0.1"
			/>
			<select
				className="form-select form-select-sm px-1 py-0 flex-shrink-0"
				value={vals[side].unit}
				onChange={(e) => handleUpdate(side, vals[side].num, e.target.value)}
				style={{ fontSize: '0.65rem', minHeight: '22px', width: '48px' }}
			>
				{SPACING_UNITS.map((u) => (
					<option key={u} value={u}>
						{u}
					</option>
				))}
			</select>
		</div>
	)

	return (
		<div className="d-flex flex-column gap-2 w-100 p-2 border rounded bg-body shadow-sm">
			<div className="d-flex align-items-center justify-content-between">
				<label
					className="small fw-semibold text-body mb-0 user-select-none text-truncate"
					htmlFor={id}
					title={`--${meta.alias}`}
					style={{ cursor: 'pointer' }}
				>
					{meta.help} <span className="text-secondary fw-normal">({meta.alias})</span>
				</label>
				<button
					type="button"
					className={`btn btn-sm py-0 px-2 ${linked ? 'btn-primary' : 'btn-outline-secondary'}`}
					onClick={() => setLinked(!linked)}
					title={linked ? "Розв'язати" : "Зв'язати"}
					style={{ fontSize: '0.65rem' }}
				>
					{linked ? "🔗 Зв'язані" : '⛓️‍💥 Окремі'}
				</button>
			</div>

			<div className="d-flex align-items-center gap-1">
				{linked ? (
					<InputSide label="Всі" side="t" />
				) : (
					<>
						<InputSide label="T" side="t" />
						<InputSide label="R" side="r" />
						<InputSide label="B" side="b" />
						<InputSide label="L" side="l" />
					</>
				)}
			</div>
		</div>
	)
}

// ═══════════════════════════════════════════════════════════
// Контролі: Колір + Прозорість + Тіні
// ═══════════════════════════════════════════════════════════

/** Візуальний селект для брендових кольорів з кружечками */
function BrandSelect({ mode, brandColors, onChange }) {
	const [open, setOpen] = useState(false)
	const selectedBrand = brandColors.find((b) => b.value === mode)

	return (
		<div className="position-relative flex-shrink-0" style={{ width: '90px' }}>
			<button
				type="button"
				className="form-select form-select-sm py-0 d-flex align-items-center gap-1 w-100 bg-white"
				onClick={() => setOpen(!open)}
				style={{ fontSize: '0.65rem', minHeight: '22px', paddingRight: '1rem', cursor: 'pointer' }}
			>
				{mode !== 'custom' && selectedBrand ? (
					<>
						<span
							style={{
								minWidth: '10px',
								height: '10px',
								borderRadius: '50%',
								background: mode,
								border: '1px solid #ccc',
							}}
						></span>
						<span className="text-truncate">{selectedBrand.label}</span>
					</>
				) : (
					<span className="text-truncate">🎨 Лінійка</span>
				)}
			</button>
			{open && (
				<>
					<div
						className="position-fixed top-0 start-0 w-100 h-100"
						style={{ zIndex: 99 }}
						onClick={() => setOpen(false)}
					></div>
					<div
						className="position-absolute top-100 start-0 bg-white border rounded rounded-3 shadow py-1 mt-1"
						style={{ zIndex: 100, minWidth: '130px', maxHeight: '220px', overflowY: 'auto' }}
					>
						<button
							type="button"
							className="dropdown-item d-flex align-items-center gap-2 px-2 py-1"
							style={{ fontSize: '0.75rem' }}
							onClick={() => {
								onChange('custom')
								setOpen(false)
							}}
						>
							🎨 Лінійка Кастом
						</button>
						<hr className="my-1 opacity-25" />
						{brandColors.map((bc) => (
							<button
								type="button"
								key={bc.value}
								className="dropdown-item d-flex align-items-center gap-2 px-2 py-1"
								style={{ fontSize: '0.75rem' }}
								onClick={() => {
									onChange(bc.value)
									setOpen(false)
								}}
							>
								<span
									style={{
										minWidth: '12px',
										height: '12px',
										borderRadius: '50%',
										background: bc.value,
										border: '1px solid #ccc',
									}}
								></span>
								{bc.label}
							</button>
						))}
					</div>
				</>
			)}
		</div>
	)
}

/** Утиліта для конвертації будь-якого кольору в HEX для піпетки */
function extractHex(colorStr) {
	const str = String(colorStr).trim()
	if (str.startsWith('#')) return str.substring(0, 7)
	const rgbaMatch = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i)
	if (rgbaMatch) {
		const r = parseInt(rgbaMatch[1]).toString(16).padStart(2, '0')
		const g = parseInt(rgbaMatch[2]).toString(16).padStart(2, '0')
		const b = parseInt(rgbaMatch[3]).toString(16).padStart(2, '0')
		return `#${r}${g}${b}`
	}
	return '#000000'
}

/** Утиліта для витягування alpha каналу (0-100) з rgba/hsla або hex8 */
function extractAlpha(colorStr) {
	const str = String(colorStr).trim()
	if (str.startsWith('#') && str.length === 9) {
		return Math.round((parseInt(str.slice(7, 9), 16) / 255) * 100)
	}
	const match = str.match(/(?:rgba?|hsla?)\([^,]+,[^,]+,[^,]+,\s*([0-9.]+)\)/i)
	return match ? Math.round(parseFloat(match[1]) * 100) : 100
}

/** Утиліта для створення кінцевого формату (rgba) */
function buildRgba(hex, alphaPercent) {
	let r = 0,
		g = 0,
		b = 0
	if (hex.length >= 7) {
		r = parseInt(hex.slice(1, 3), 16)
		g = parseInt(hex.slice(3, 5), 16)
		b = parseInt(hex.slice(5, 7), 16)
	}
	if (alphaPercent === 100)
		return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
	return `rgba(${r}, ${g}, ${b}, ${(alphaPercent / 100).toFixed(2)})`
}

function ColorAlphaPicker({ id, value, onChange }) {
	const brandColors = [
		{ label: 'Primary', value: '#0d6efd' },
		{ label: 'Secondary', value: '#6c757d' },
		{ label: 'Success', value: '#198754' },
		{ label: 'Danger', value: '#dc3545' },
		{ label: 'Warning', value: '#ffc107' },
		{ label: 'Info', value: '#0dcaf0' },
		{ label: 'Light', value: '#f8f9fa' },
		{ label: 'Dark', value: '#212529' },
		{ label: 'White', value: '#ffffff' },
		{ label: 'Black', value: '#000000' },
	]

	const initAlpha = extractAlpha(value)
	const initHex = extractHex(value)
	const matchedBrand = brandColors.find((bc) => bc.value.toLowerCase() === initHex.toLowerCase())

	const [mode, setMode] = useState(matchedBrand ? matchedBrand.value : 'custom')
	const [hexValue, setHexValue] = useState(initHex)
	const [alpha, setAlpha] = useState(initAlpha)

	useEffect(() => {
		const hex = extractHex(value)
		const a = extractAlpha(value)
		const brand = brandColors.find((bc) => bc.value.toLowerCase() === hex.toLowerCase())
		setHexValue(hex)
		setAlpha(a)
		setMode(brand ? brand.value : 'custom')
	}, [value])

	return (
		<div className="d-flex align-items-center gap-1 w-100 flex-wrap">
			<BrandSelect
				brandColors={brandColors}
				mode={mode}
				onChange={(newMode) => {
					setMode(newMode)
					if (newMode !== 'custom') {
						setHexValue(newMode)
						onChange(buildRgba(newMode, alpha))
					}
				}}
			/>

			<input
				type="color"
				className="form-control form-control-color border-0 p-0 shadow-sm flex-shrink-0"
				id={id}
				value={hexValue}
				onChange={(e) => {
					setMode('custom')
					setHexValue(e.target.value)
					onChange(buildRgba(e.target.value, alpha))
				}}
				style={{ width: '22px', height: '22px', cursor: 'pointer' }}
				disabled={mode !== 'custom'}
				title={hexValue}
			/>

			<div
				className="input-group input-group-sm flex-grow-1"
				title="Alpha (Opacity)"
				style={{ minWidth: '100px' }}
			>
				<span className="input-group-text px-1 py-0 text-muted" style={{ fontSize: '0.65rem' }}>
					α
				</span>
				<input
					type="range"
					className="form-range form-control px-1 py-0"
					min="0"
					max="100"
					step="1"
					value={alpha}
					onChange={(e) => {
						const v = Number(e.target.value)
						setAlpha(v)
						onChange(buildRgba(hexValue, v))
					}}
					style={{ minHeight: '22px' }}
				/>
				<span
					className="input-group-text px-1 py-0 font-monospace text-center"
					style={{ fontSize: '0.65rem', minWidth: '40px' }}
				>
					{alpha}%
				</span>
			</div>
		</div>
	)
}

function ColorAlphaControl({ id, meta, value, onChange }) {
	return (
		<div className="d-flex flex-column gap-1 w-100">
			<label
				className="small text-body mb-0 user-select-none text-truncate"
				htmlFor={id}
				title={`--${meta.alias}`}
				style={{ width: '100%', cursor: 'pointer' }}
			>
				{meta.help}
			</label>
			<ColorAlphaPicker id={id} value={value} onChange={onChange} />
		</div>
	)
}

function parseBorder(value) {
	const str = String(value).trim()
	if (!str || str === 'none' || str === '0')
		return { width: 1, unit: 'px', style: 'solid', color: '#000000' }

	// e.g. "1px solid #dee2e6" or "2rem dashed rgba(0,0,0,0.5)"
	const parts = str.split(/(?<=^[^\s]+\s+[^\s]+)\s+/) // Splits after second space.
	if (parts.length === 2) {
		const ws = parts[0].trim().split(/\s+/) // [width, style]
		const wMatch = ws[0].match(/^([0-9]*\.?[0-9]+)([a-z%]*)$/i)
		return {
			width: wMatch ? parseFloat(wMatch[1]) : 1,
			unit: wMatch ? wMatch[2] || 'px' : 'px',
			style: ws[1] || 'solid',
			color: parts[1].trim(),
		}
	}
	return { width: 1, unit: 'px', style: 'solid', color: '#000000' }
}

function BorderControl({ id, meta, value, onChange }) {
	const parsed = parseBorder(value)
	const [width, setWidth] = useState(parsed.width)
	const [unit, setUnit] = useState(parsed.unit)
	const [style, setStyle] = useState(parsed.style)
	const [color, setColor] = useState(parsed.color)

	useEffect(() => {
		const p = parseBorder(value)
		setWidth(p.width)
		setUnit(p.unit)
		setStyle(p.style)
		setColor(p.color)
	}, [value])

	const handleUpdate = (nw, nu, ns, nc) => {
		onChange(`${nw}${nu} ${ns} ${nc}`)
	}

	return (
		<div className="d-flex flex-column gap-2 w-100 p-2 border rounded bg-body shadow-sm">
			<label
				className="small fw-semibold text-body mb-0 user-select-none text-truncate"
				htmlFor={id}
				title={`--${meta.alias}`}
				style={{ width: '100%', cursor: 'pointer' }}
			>
				{meta.help} <span className="text-secondary fw-normal">({meta.alias})</span>
			</label>

			<div className="d-flex align-items-center gap-2 flex-wrap">
				<div className="input-group input-group-sm" style={{ width: '80px', flexShrink: 0 }}>
					<input
						type="number"
						className="form-control px-1 py-0 text-center font-monospace"
						value={width}
						onChange={(e) => handleUpdate(Number(e.target.value), unit, style, color)}
						style={{ fontSize: '0.75rem', minHeight: '24px' }}
						step="0.5"
					/>
					<select
						className="form-select form-select-sm px-1 py-0"
						value={unit}
						onChange={(e) => handleUpdate(width, e.target.value, style, color)}
						style={{ fontSize: '0.65rem', minHeight: '24px', paddingRight: '1rem' }}
					>
						<option value="px">px</option>
						<option value="rem">rem</option>
						<option value="em">em</option>
					</select>
				</div>

				<select
					className="form-select form-select-sm flex-grow-1 py-0"
					value={style}
					onChange={(e) => handleUpdate(width, unit, e.target.value, color)}
					style={{ fontSize: '0.75rem', minHeight: '24px', minWidth: '70px' }}
				>
					<option value="solid">solid</option>
					<option value="dashed">dashed</option>
					<option value="dotted">dotted</option>
					<option value="double">double</option>
					<option value="none">none</option>
				</select>
			</div>

			<div className="mt-1 d-flex align-items-center gap-1 w-100 border-top pt-2">
				<span className="small text-muted" style={{ fontSize: '0.65rem', width: '30px' }}>
					Колір
				</span>
				<div className="flex-grow-1">
					<ColorAlphaPicker
						id={`${id}-color`}
						value={color}
						onChange={(nc) => handleUpdate(width, unit, style, nc)}
					/>
				</div>
			</div>
		</div>
	)
}

function ShadowControl({ id, meta, value, onChange }) {
	const parsed = parseShadow(value)
	const [x, setX] = useState(parsed.x)
	const [y, setY] = useState(parsed.y)
	const [blur, setBlur] = useState(parsed.blur)
	const [spread, setSpread] = useState(parsed.spread)
	const [color, setColor] = useState(parsed.color)

	useEffect(() => {
		const p = parseShadow(value)
		setX(p.x)
		setY(p.y)
		setBlur(p.blur)
		setSpread(p.spread)
		setColor(p.color)
	}, [value])

	const handleUpdate = (nx, ny, nb, ns, nc) => {
		onChange(`${nx}px ${ny}px ${nb}px${ns !== null ? ` ${ns}px` : ''} ${nc}`)
	}

	return (
		<div className="d-flex flex-column gap-2 w-100 p-2 border rounded bg-body shadow-sm">
			<label
				className="small fw-semibold text-body mb-0 user-select-none text-truncate"
				htmlFor={id}
				title={`--${meta.alias}`}
				style={{ width: '100%', cursor: 'pointer' }}
			>
				{meta.help} <span className="text-secondary fw-normal">({meta.alias})</span>
			</label>

			{/* Координати: X, Y, Blur */}
			<div className="d-flex align-items-center gap-1">
				<div title="X Offset" className="input-group input-group-sm flex-grow-1">
					<span className="input-group-text px-1 py-0 text-muted" style={{ fontSize: '0.65rem' }}>
						X
					</span>
					<input
						type="number"
						className="form-control px-1 py-0 text-center font-monospace"
						value={x}
						onChange={(e) => {
							const v = Number(e.target.value)
							setX(v)
							handleUpdate(v, y, blur, spread, color)
						}}
						style={{ fontSize: '0.75rem', minHeight: '22px' }}
					/>
				</div>
				<div title="Y Offset" className="input-group input-group-sm flex-grow-1">
					<span className="input-group-text px-1 py-0 text-muted" style={{ fontSize: '0.65rem' }}>
						Y
					</span>
					<input
						type="number"
						className="form-control px-1 py-0 text-center font-monospace"
						value={y}
						onChange={(e) => {
							const v = Number(e.target.value)
							setY(v)
							handleUpdate(x, v, blur, spread, color)
						}}
						style={{ fontSize: '0.75rem', minHeight: '22px' }}
					/>
				</div>
				<div title="Blur Radius" className="input-group input-group-sm flex-grow-1">
					<span className="input-group-text px-1 py-0 text-muted" style={{ fontSize: '0.65rem' }}>
						B
					</span>
					<input
						type="number"
						className="form-control px-1 py-0 text-center font-monospace"
						value={blur}
						min="0"
						onChange={(e) => {
							const v = Number(e.target.value)
							setBlur(v)
							handleUpdate(x, y, v, spread, color)
						}}
						style={{ fontSize: '0.75rem', minHeight: '22px' }}
					/>
				</div>
			</div>

			{/* Колір та Прозорість */}
			<ColorAlphaPicker
				value={color}
				onChange={(nc) => {
					setColor(nc)
					handleUpdate(x, y, blur, spread, nc)
				}}
			/>
		</div>
	)
}

// ═══════════════════════════════════════════════════════════
// Інспектор
// ═══════════════════════════════════════════════════════════
export function OlmuiInspector({ StylesClass, children, onUpdate }) {
	if (!StylesClass || typeof StylesClass !== 'function') {
		return <>{children}</>
	}
	const fields = useMemo(() => extractFields(StylesClass), [StylesClass])
	const groups = useMemo(() => groupFields(fields), [fields])
	const STORAGE_KEY = `olmui:inspector:${StylesClass.name}`

	// 1. Початковий стейт
	const defaultValues = useMemo(() => {
		const init = {}
		for (const { key, meta } of fields) init[key] = meta.default
		return init
	}, [fields])

	const [values, setValues] = useState(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY)
			if (saved) return JSON.parse(saved)
		} catch (e) {
			console.warn('OlmuiInspector: Failed to read from localStorage', e)
		}
		return defaultValues
	})

	const [history, setHistory] = useState([])
	const [collapsed, setCollapsed] = useState(true)
	const [theme, setTheme] = useState('light')

	// Зберігаємо стейт
	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(values))
		} catch (e) {
			console.warn('OlmuiInspector: Failed to save to localStorage', e)
		}
	}, [values, STORAGE_KEY])

	const handleChange = (key, value) => {
		setHistory((prev) => {
			const newHistory = [...prev, values]
			if (newHistory.length > 50) newHistory.shift() // зберігаємо останні 50 кроків
			return newHistory
		})

		setValues((prev) => ({ ...prev, [theme === 'dark' ? key + 'Dark' : key]: value }))
	}

	const handleUndo = () => {
		if (history.length === 0) return
		setHistory((prev) => {
			const newHistory = [...prev]
			const lastState = newHistory.pop()
			setValues(lastState)
			return newHistory
		})
	}

	const [showResetConfirm, setShowResetConfirm] = useState(false)
	const [showExportModal, setShowExportModal] = useState(false)
	const [exportFormat, setExportFormat] = useState('css')
	const [exportCopied, setExportCopied] = useState(false)

	const handleReset = () => {
		setHistory([])
		setValues(defaultValues)
		setShowResetConfirm(false)
	}

	const handleExport = () => {
		setShowExportModal(true)
		setExportCopied(false)
	}

	const copyToClipboard = (text) => {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				setExportCopied(true)
				setTimeout(() => setExportCopied(false), 2000)
			})
			.catch((err) => console.error('Failed to copy', err))
	}

	const instanceId = useMemo(() => Math.random().toString(36).substring(2, 9), [])

	const cssVarsLight = {}
	const cssVarsDark = {}

	for (const { key, meta } of fields) {
		const valLight = values[key] !== undefined ? values[key] : meta.default
		const valDark =
			values[key + 'Dark'] !== undefined
				? values[key + 'Dark']
				: meta.defaultDark !== undefined
					? meta.defaultDark
					: valLight
		const lightCss = toCssValue(valLight, meta)
		const darkCss = toCssValue(valDark, meta)
		cssVarsLight[`--${meta.alias}`] = lightCss
		if (darkCss !== lightCss) {
			cssVarsDark[`--${meta.alias}`] = darkCss
		}
	}

	return (
		<div className="olmui-inspector-container position-relative">
			<div
				className="d-flex justify-content-end mb-2 position-absolute top-0 end-0 gap-2"
				style={{ zIndex: 100, transform: 'translateY(-110%)' }}
			>
				<button
					type="button"
					className={`btn btn-sm ${theme === 'dark' ? 'btn-dark' : 'btn-light border'} d-flex align-items-center gap-2 shadow-sm`}
					onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
					title="Перемкнути темну тему"
				>
					<span>{theme === 'dark' ? '🌙' : '☀️'}</span>
				</button>
				<button
					type="button"
					className={`btn btn-sm ${collapsed ? 'btn-outline-secondary bg-body' : 'btn-primary'} d-flex align-items-center gap-2 shadow-sm`}
					onClick={() => setCollapsed((v) => !v)}
				>
					<span>⚙️</span>
					<span className="fw-semibold small">
						{collapsed ? 'Налаштування OLMUI' : 'Сховати панель'}
					</span>
					<span style={{ fontSize: '0.65rem' }}>{collapsed ? '▼' : '▲'}</span>
				</button>
			</div>

			{!collapsed && (
				<div
					className="border rounded-3 shadow-sm mb-4 overflow-hidden position-relative"
					style={{ background: 'var(--bs-body-bg)' }}
				>
					<div
						className="bg-body-tertiary px-3 py-2 border-bottom d-flex align-items-center justify-content-between sticky-top shadow-sm"
						style={{ zIndex: 10 }}
					>
						<strong className="text-body-secondary small text-uppercase fw-bold">
							⚙️ {StylesClass.name} Inspector ({fields.length} variables){' '}
							{theme === 'dark' && <span className="badge bg-dark ms-2">Dark</span>}
						</strong>
						<div className="d-flex gap-2">
							<button
								type="button"
								className="btn btn-sm btn-outline-secondary py-0 d-flex align-items-center gap-1"
								onClick={handleUndo}
								disabled={history.length === 0}
								title="Відмінити останню зміну"
							>
								<span style={{ fontSize: '0.75rem' }}>↩️ Undo ({history.length})</span>
							</button>
							{showResetConfirm ? (
								<div className="d-flex align-items-center gap-1">
									<span className="small text-danger fw-bold" style={{ fontSize: '0.7rem' }}>
										Скинути?
									</span>
									<button
										type="button"
										className="btn btn-sm btn-danger py-0 px-2"
										onClick={handleReset}
										style={{ fontSize: '0.7rem' }}
									>
										✓ Так
									</button>
									<button
										type="button"
										className="btn btn-sm btn-outline-secondary py-0 px-2"
										onClick={() => setShowResetConfirm(false)}
										style={{ fontSize: '0.7rem' }}
									>
										✕
									</button>
								</div>
							) : (
								<button
									type="button"
									className="btn btn-sm btn-outline-danger py-0 d-flex align-items-center gap-1"
									onClick={() => setShowResetConfirm(true)}
									title="Скинути до базових"
								>
									<span style={{ fontSize: '0.75rem' }}>🔄 Reset</span>
								</button>
							)}
							<button
								type="button"
								className="btn btn-sm btn-outline-primary py-0 d-flex align-items-center gap-1 ms-1"
								onClick={handleExport}
								title="Експортувати налаштування"
							>
								<span style={{ fontSize: '0.75rem' }}>📤 Export</span>
							</button>
							{onUpdate && (
								<button
									type="button"
									className="btn btn-sm btn-primary py-0 d-flex align-items-center gap-1 ms-1"
									onClick={() => onUpdate(values)}
									title="Зберегти стан"
								>
									<span style={{ fontSize: '0.75rem' }}>💾 Save</span>
								</button>
							)}
						</div>
					</div>

					<div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
						{[...groups.entries()].map(([section, sectionFields], idx) => (
							<details key={section} className="border-bottom" open={idx === 0}>
								<summary
									className="px-3 py-2 bg-body-tertiary font-monospace text-secondary user-select-none"
									style={{ fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}
								>
									{section}
								</summary>
								<div
									className="p-3 bg-body"
									style={{
										display: 'grid',
										gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
										gap: '1rem',
										alignItems: 'center',
									}}
								>
									{sectionFields.map(({ key, meta }) => {
										const controlType = inferControlType(meta)
										const currentVal =
											theme === 'dark' && values[key + 'Dark'] !== undefined
												? values[key + 'Dark']
												: theme === 'dark' && meta.defaultDark
													? meta.defaultDark
													: values[key]

										return (
											<div
												key={key}
												className="d-flex align-items-center w-100"
												style={{ minHeight: '28px' }}
											>
												{controlType === 'switch' && (
													<div className="form-check form-switch mb-0 d-flex gap-2">
														<input
															className="form-check-input mt-0"
															type="checkbox"
															id={`oi-${key}`}
															checked={currentVal}
															onChange={(e) => handleChange(key, e.target.checked)}
															style={{ cursor: 'pointer' }}
														/>
														<label
															className="form-check-label small text-body user-select-none"
															htmlFor={`oi-${key}`}
															style={{ cursor: 'pointer' }}
														>
															{meta.help}
														</label>
													</div>
												)}
												{controlType === 'spacing' && (
													<SpacingControl
														id={`oi-${key}`}
														meta={meta}
														value={currentVal}
														onChange={(v) => handleChange(key, v)}
													/>
												)}
												{controlType === 'size' && (
													<SizeControl
														id={`oi-${key}`}
														meta={meta}
														value={currentVal}
														onChange={(v) => handleChange(key, v)}
													/>
												)}
												{controlType === 'shadow' && (
													<ShadowControl
														id={`oi-${key}`}
														meta={meta}
														value={currentVal}
														onChange={(v) => handleChange(key, v)}
													/>
												)}
												{controlType === 'select' && (
													<SelectControl
														id={`oi-${key}`}
														meta={meta}
														value={currentVal}
														onChange={(v) => handleChange(key, v)}
													/>
												)}
												{controlType === 'color' && (
													<ColorAlphaControl
														id={`oi-${key}`}
														meta={meta}
														value={currentVal}
														onChange={(v) => handleChange(key, v)}
													/>
												)}
												{controlType === 'border' && (
													<BorderControl
														id={`oi-${key}`}
														meta={meta}
														value={currentVal}
														onChange={(v) => handleChange(key, v)}
													/>
												)}
												{controlType === 'text' && (
													<div className="d-flex align-items-center gap-2 w-100">
														<label
															className="small text-body mb-0 user-select-none text-truncate"
															htmlFor={`oi-${key}`}
															title={`--${meta.alias}`}
															style={{ width: '110px' }}
														>
															{meta.help}
														</label>
														<input
															type="text"
															className="form-control form-control-sm font-monospace flex-grow-1 py-0"
															id={`oi-${key}`}
															value={currentVal}
															onChange={(e) => handleChange(key, e.target.value)}
															style={{ fontSize: '0.75rem', minHeight: '24px' }}
														/>
													</div>
												)}
												{controlType === 'number' && (
													<div className="d-flex align-items-center gap-2 w-100">
														<label
															className="small text-body mb-0 user-select-none text-truncate flex-grow-1"
															htmlFor={`oi-${key}`}
															title={`--${meta.alias}`}
														>
															{meta.help}
														</label>
														<input
															type="number"
															className="form-control form-control-sm py-0 flex-shrink-0"
															id={`oi-${key}`}
															value={currentVal}
															onChange={(e) => handleChange(key, Number(e.target.value))}
															style={{ width: '80px', minHeight: '24px' }}
														/>
													</div>
												)}
											</div>
										)
									})}
								</div>
							</details>
						))}
					</div>
				</div>
			)}

			<style>{`
				.olmui-preview-${instanceId} {
					${Object.entries(cssVarsLight)
						.map(([k, v]) => `${k}: ${v};`)
						.join('\n\t\t\t\t\t')}
				}
				.olmui-preview-${instanceId}[data-bs-theme="dark"],
				[data-bs-theme="dark"] .olmui-preview-${instanceId} {
					${Object.entries(cssVarsDark)
						.map(([k, v]) => `${k}: ${v};`)
						.join('\n\t\t\t\t\t')}
				}
			`}</style>
			<div
				style={{ margin: '-1rem', overflow: 'visible', minHeight: '140px' }}
				className={`olmui-preview-canvas olmui-preview-${instanceId}`}
				data-bs-theme={theme}
			>
				{children}
			</div>

			{showExportModal && (
				<div
					className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
					style={{ zIndex: 1050, backgroundColor: 'rgba(0,0,0,0.5)' }}
					onClick={() => setShowExportModal(false)}
				>
					<div
						className="bg-body border rounded shadow-lg p-0"
						style={{ minWidth: '600px', maxWidth: '90vw' }}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="d-flex justify-content-between align-items-center p-3 border-bottom">
							<h5 className="fw-bold mb-0">Експорт стилів</h5>
							<button className="btn-close" onClick={() => setShowExportModal(false)}></button>
						</div>
						<div className="p-4">
							<p className="small text-muted mb-3">
								Скопіюйте згенерований код і вставте його у ваш CSS/SCSS або конфігурацію
								ініціалізації для збереження налаштувань.
							</p>
							<div className="d-flex mb-3 gap-2">
								<button
									className={`btn btn-sm ${exportFormat === 'css' ? 'btn-primary' : 'btn-outline-secondary'}`}
									onClick={() => setExportFormat('css')}
								>
									🎨 CSS Variables
								</button>
								<button
									className={`btn btn-sm ${exportFormat === 'json' ? 'btn-primary' : 'btn-outline-secondary'}`}
									onClick={() => setExportFormat('json')}
								>
									📦 JSON State
								</button>
							</div>
							<div className="position-relative">
								<pre
									className="bg-dark text-light p-3 rounded-3 overflow-auto m-0"
									style={{ maxHeight: '450px', fontSize: '0.85rem' }}
								>
									{exportFormat === 'css'
										? `:root {\n\t/* Світла тема (за замовчуванням) */\n\t${Object.entries(
												cssVarsLight,
											)
												.map(([k, v]) => `${k}: ${v};`)
												.join(
													'\n\t',
												)}\n}\n\n[data-bs-theme="dark"] {\n\t/* Темна тема */\n\t${Object.entries(
												cssVarsDark,
											)
												.map(([k, v]) => `${k}: ${v};`)
												.join('\n\t')}\n}`
										: JSON.stringify(values, null, 2)}
								</pre>
								<button
									className={`btn btn-sm position-absolute top-0 end-0 m-2 shadow-sm ${exportCopied ? 'btn-success' : 'btn-light'}`}
									onClick={() =>
										copyToClipboard(
											exportFormat === 'css'
												? `:root {\n\t${Object.entries(cssVarsLight)
														.map(([k, v]) => `${k}: ${v};`)
														.join('\n\t')}\n}\n\n[data-bs-theme="dark"] {\n\t${Object.entries(
														cssVarsDark,
													)
														.map(([k, v]) => `${k}: ${v};`)
														.join('\n\t')}\n}`
												: JSON.stringify(values, null, 2),
										)
									}
								>
									{exportCopied ? '✓' : '📋'}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
