import React, { useState } from 'react'
import useSortableList from '../src/hooks/useSortableList.js'

// ─── DATA ────────────────────────────────────────────────────

const AI_MODELS = [
	{ id: 'llama-4-scout', label: 'Llama 4 Scout 17B', sub: '2100 tok/s', emoji: '🦙' },
	{ id: 'qwen-2.5', label: 'Qwen 2.5 Coder 32B', sub: '950 tok/s', emoji: '🧠' },
	{ id: 'deepseek-r1', label: 'DeepSeek R1 70B', sub: '850 tok/s', emoji: '🔬' },
	{ id: 'llama-3.3', label: 'Llama 3.3 70B', sub: '780 tok/s', emoji: '🦙' },
]

const LAYERS = [
	{ id: 'header', label: 'Header', sub: 'z-index: 100', emoji: '🔝' },
	{ id: 'sidebar', label: 'Sidebar Nav', sub: 'z-index: 50', emoji: '📑' },
	{ id: 'content', label: 'Main Content', sub: 'z-index: 10', emoji: '📄' },
	{ id: 'modal', label: 'Modal Overlay', sub: 'z-index: 200', emoji: '🪟' },
	{ id: 'toast', label: 'Toast Alerts', sub: 'z-index: 300', emoji: '🔔' },
]

const PLAYLIST = [
	{ id: 'track1', label: 'Eternal Sunshine', sub: 'Jhené Aiko • 3:42', emoji: '☀️' },
	{ id: 'track2', label: 'Blinding Lights', sub: 'The Weeknd • 3:20', emoji: '💡' },
	{ id: 'track3', label: 'Breathe Deeper', sub: 'Tame Impala • 6:12', emoji: '🌊' },
	{ id: 'track4', label: 'Midnight City', sub: 'M83 • 4:03', emoji: '🌃' },
	{ id: 'track5', label: 'Electric Feel', sub: 'MGMT • 3:49', emoji: '⚡' },
]

const TABS = [
	{
		key: 'models',
		label: '🤖 AI Models',
		data: AI_MODELS,
		persist: 'demo_models',
		accent: '#10b981',
		hint: 'Model fallback priority for Cerebras inference',
	},
	{
		key: 'layers',
		label: '🎨 UI Layers',
		data: LAYERS,
		persist: 'demo_layers',
		accent: '#8b5cf6',
		hint: 'Z-index stack order for layout components',
	},
	{
		key: 'playlist',
		label: '🎵 Playlist',
		data: PLAYLIST,
		persist: 'demo_playlist',
		accent: '#f59e0b',
		hint: 'Queue order — first track plays next',
	},
]

// ─── STYLES ──────────────────────────────────────────────────

const css = {
	wrap: {
		maxWidth: 560,
		margin: '1rem auto',
		fontFamily: 'system-ui, -apple-system, sans-serif',
		color: '#e2e8f0',
	},
	tabs: {
		display: 'flex',
		gap: 4,
		marginBottom: 16,
		borderBottom: '1px solid rgba(255,255,255,0.06)',
		paddingBottom: 8,
	},
	tab: (active) => ({
		padding: '6px 14px',
		borderRadius: 6,
		border: 'none',
		background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
		color: active ? '#f1f5f9' : '#64748b',
		fontWeight: active ? 600 : 400,
		fontSize: '0.8rem',
		cursor: 'pointer',
		transition: 'all 0.15s',
	}),
	hint: {
		fontSize: '0.75rem',
		color: '#64748b',
		margin: '0 0 10px',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	list: {
		display: 'flex',
		flexDirection: 'column',
		gap: 4,
	},
	row: (isFirst, isDragging, isOver, accent) => ({
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		padding: '8px 12px',
		borderRadius: 8,
		background: isOver
			? 'rgba(59,130,246,0.12)'
			: isFirst
				? `linear-gradient(135deg, ${accent}22, ${accent}11)`
				: 'rgba(255,255,255,0.04)',
		border: isOver
			? '1px solid rgba(59,130,246,0.4)'
			: isFirst
				? `1px solid ${accent}55`
				: '1px solid rgba(255,255,255,0.06)',
		opacity: isDragging ? 0.35 : 1,
		transform: isOver ? 'scale(1.01)' : 'none',
		transition: 'all 0.12s ease',
		cursor: 'grab',
		userSelect: 'none',
	}),
	grip: { fontSize: '0.65rem', color: '#475569', flexShrink: 0, cursor: 'grab' },
	rank: (isFirst, accent) => ({
		fontSize: '0.7rem',
		fontWeight: 700,
		color: isFirst ? accent : '#4b5563',
		width: 16,
		textAlign: 'center',
		flexShrink: 0,
	}),
	emoji: { fontSize: '1rem', flexShrink: 0 },
	info: { flex: 1, minWidth: 0 },
	label: (isFirst) => ({
		fontWeight: 600,
		fontSize: '0.85rem',
		color: isFirst ? '#f1f5f9' : '#cbd5e1',
		lineHeight: 1.3,
	}),
	sub: (isFirst, accent) => ({
		fontSize: '0.7rem',
		color: isFirst ? accent + 'bb' : '#52525b',
		marginTop: 1,
	}),
	btns: { display: 'flex', gap: 3, flexShrink: 0 },
	btn: (disabled) => ({
		width: 26,
		height: 26,
		borderRadius: 5,
		border: 'none',
		background: disabled ? 'transparent' : 'rgba(255,255,255,0.06)',
		color: disabled ? '#1e293b' : '#94a3b8',
		cursor: disabled ? 'default' : 'pointer',
		fontSize: '0.8rem',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	}),
	reset: {
		marginTop: 10,
		padding: '5px 14px',
		borderRadius: 5,
		border: '1px solid rgba(255,255,255,0.1)',
		background: 'rgba(255,255,255,0.03)',
		color: '#64748b',
		cursor: 'pointer',
		fontSize: '0.75rem',
	},
	log: {
		marginTop: 12,
		padding: '6px 10px',
		borderRadius: 6,
		background: 'rgba(0,0,0,0.25)',
		color: '#4ade80',
		fontFamily: 'ui-monospace, monospace',
		fontSize: '0.7rem',
		overflow: 'auto',
		whiteSpace: 'pre',
	},
	code: {
		marginTop: 16,
		padding: '12px 14px',
		borderRadius: 8,
		background: 'rgba(0,0,0,0.3)',
		border: '1px solid rgba(255,255,255,0.06)',
		fontFamily: 'ui-monospace, monospace',
		fontSize: '0.72rem',
		color: '#94a3b8',
		lineHeight: 1.5,
		overflow: 'auto',
		whiteSpace: 'pre',
	},
}

// ─── SORTABLE LIST PANEL ─────────────────────────────────────

function SortablePanel({ data, persistKey, accent, hint }) {
	const [log, setLog] = useState('')
	const [dragIdx, setDragIdx] = useState(null)
	const [overIdx, setOverIdx] = useState(null)

	const { items, moveUp, moveDown, moveTo, reset } = useSortableList(data, {
		persist: persistKey,
		onChange: (next) => setLog(next.map((m) => m.id).join(' → ')),
	})

	const onDragStart = (i) => (e) => {
		setDragIdx(i)
		e.dataTransfer.effectAllowed = 'move'
	}
	const onDragOver = (i) => (e) => {
		e.preventDefault()
		if (overIdx !== i) setOverIdx(i)
	}
	const onDrop = (i) => (e) => {
		e.preventDefault()
		if (dragIdx !== null && dragIdx !== i) moveTo(dragIdx, i)
		setDragIdx(null)
		setOverIdx(null)
	}
	const onDragEnd = () => {
		setDragIdx(null)
		setOverIdx(null)
	}

	return (
		<>
			<div style={css.hint}>
				<span>{hint}</span>
				<span style={{ fontSize: '0.65rem', color: '#374151' }}>drag · ↑↓ · reset</span>
			</div>

			<div style={css.list}>
				{items.map((item, idx) => {
					const first = idx === 0
					return (
						<div
							key={item.id}
							draggable
							onDragStart={onDragStart(idx)}
							onDragOver={onDragOver(idx)}
							onDrop={onDrop(idx)}
							onDragEnd={onDragEnd}
							style={css.row(first, dragIdx === idx, overIdx === idx && dragIdx !== idx, accent)}
						>
							<span style={css.grip}>⠿</span>
							<span style={css.rank(first, accent)}>{idx + 1}</span>
							<span style={css.emoji}>{item.emoji}</span>
							<div style={css.info}>
								<div style={css.label(first)}>{item.label}</div>
								<div style={css.sub(first, accent)}>{item.sub}</div>
							</div>
							<div style={css.btns}>
								<button
									onClick={() => moveUp(idx)}
									disabled={idx === 0}
									aria-label={`Move ${item.label} up`}
									style={css.btn(idx === 0)}
								>
									↑
								</button>
								<button
									onClick={() => moveDown(idx)}
									disabled={idx === items.length - 1}
									aria-label={`Move ${item.label} down`}
									style={css.btn(idx === items.length - 1)}
								>
									↓
								</button>
							</div>
						</div>
					)
				})}
			</div>

			<button onClick={reset} style={css.reset}>
				↻ Reset order
			</button>

			{log && <div style={css.log}>{log}</div>}
		</>
	)
}

// ─── MAIN DEMO ───────────────────────────────────────────────

export default function SortableListDemo() {
	const [activeTab, setActiveTab] = useState('models')
	const tab = TABS.find((t) => t.key === activeTab)

	return (
		<div style={css.wrap}>
			{/* Tab navigation */}
			<div style={css.tabs}>
				{TABS.map((t) => (
					<button
						key={t.key}
						onClick={() => setActiveTab(t.key)}
						style={css.tab(activeTab === t.key)}
					>
						{t.label}
					</button>
				))}
			</div>

			{/* Active panel */}
			<SortablePanel
				key={tab.key}
				data={tab.data}
				persistKey={tab.persist}
				accent={tab.accent}
				hint={tab.hint}
			/>

			{/* Usage snippet */}
			<div style={css.code}>
				{`import { useSortableList } from '@nan0web/ui-react'

const { items, moveUp, moveDown, moveTo, reset } = useSortableList(
  ${tab.key === 'models' ? 'models' : tab.key === 'layers' ? 'layers' : 'tracks'}, {
    persist: '${tab.persist}',
    onChange: (items) => console.log(items),
  }
)`}
			</div>
		</div>
	)
}
