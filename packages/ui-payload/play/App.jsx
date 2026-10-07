import React, { useState } from 'react'
import { ImageCell } from '../src/components/ImageCell.jsx'
import { BooleanCell } from '../src/components/BooleanCell.jsx'
import { MapCell } from '../src/components/MapCell.jsx'

const SAMPLE_ROWS = [
	{
		id: '1',
		title: 'Київське Центральне Відділення',
		slug: 'kyiv-central',
		image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=300&q=80',
		hidden: false,
		lat: '50.4501',
		lng: '30.5234',
		address: 'м. Київ, вул. Хрещатик, 1',
	},
	{
		id: '2',
		title: 'Львівський Фінансовий Хаб',
		slug: 'lviv-hub',
		image: null,
		hidden: true,
		lat: '49.8429',
		lng: '24.0311',
		address: 'м. Львів, пл. Ринок, 10',
	},
	{
		id: '3',
		title: 'Одеське Морське Представництво',
		slug: 'odesa-sea',
		image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&q=80',
		hidden: false,
		lat: '46.4825',
		lng: '30.7233',
		address: 'м. Одеса, вул. Дерибасівська, 5',
	},
]

export function App() {
	const [theme, setTheme] = useState('dark')

	const isDark = theme === 'dark'
	const bg = isDark ? '#0f1117' : '#f8f9fa'
	const cardBg = isDark ? '#161922' : '#ffffff'
	const text = isDark ? '#e6edf3' : '#1f2328'
	const border = isDark ? '#30363d' : '#d0d7de'

	return (
		<div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: 'system-ui, -apple-system, sans-serif', padding: '32px' }}>
			<header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
				<div>
					<h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>⚙️ @nan0web/ui-payload — Sandbox View</h1>
					<p style={{ margin: '6px 0 0 0', color: '#8b949e', fontSize: '14px' }}>
						Visual Golden Master Sandbox for Payload CMS Custom Cells (ImageCell, BooleanCell, MapCell)
					</p>
				</div>
				<button
					onClick={() => setTheme(isDark ? 'light' : 'dark')}
					style={{
						padding: '8px 16px',
						borderRadius: '6px',
						cursor: 'pointer',
						background: isDark ? '#21262d' : '#eaeef2',
						border: `1px solid ${border}`,
						color: text,
						fontWeight: 600,
					}}
				>
					{isDark ? '☀️ Light' : '🌙 Dark'}
				</button>
			</header>

			<main style={{ background: cardBg, borderRadius: '8px', border: `1px solid ${border}`, overflow: 'hidden' }}>
				<div style={{ padding: '16px 20px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					<span style={{ fontWeight: 600, fontSize: '16px' }}>Collection: Branches / Відділення</span>
					<span style={{ fontSize: '13px', color: '#8b949e' }}>3 records</span>
				</div>

				<div style={{ overflowX: 'auto' }}>
					<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
						<thead>
							<tr style={{ background: isDark ? '#1c212c' : '#f6f8fa', borderBottom: `1px solid ${border}` }}>
								<th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, width: '220px' }}>Image (ImageCell)</th>
								<th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>Title</th>
								<th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, width: '140px' }}>Status (BooleanCell)</th>
								<th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>Location (MapCell)</th>
							</tr>
						</thead>
						<tbody>
							{SAMPLE_ROWS.map((row) => (
								<tr key={row.id} style={{ borderBottom: `1px solid ${border}` }}>
									<td style={{ padding: '12px 16px' }}>
										<ImageCell cellData={row.image} />
									</td>
									<td style={{ padding: '12px 16px' }}>
										<div style={{ fontWeight: 600, fontSize: '14px' }}>{row.title}</div>
										<div style={{ fontSize: '12px', color: '#8b949e' }}>slug: {row.slug}</div>
									</td>
									<td style={{ padding: '12px 16px' }}>
										<BooleanCell cellData={row.hidden} field={{ name: 'hidden' }} />
									</td>
									<td style={{ padding: '12px 16px' }}>
										<MapCell rowData={row} />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</main>
		</div>
	)
}

export default App
