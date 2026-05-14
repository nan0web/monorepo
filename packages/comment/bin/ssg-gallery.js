import fs from 'node:fs'
import path from 'node:path'

const SSG_DIR = path.join(process.cwd(), 'snapshots', 'ssg')
const OUT_FILE = path.join(process.cwd(), 'public', 'ssg-gallery.html')

if (!fs.existsSync(SSG_DIR)) {
	console.log(`[SSG Gallery] 🚫 Directory not found: ${SSG_DIR}`)
	process.exit(0)
}

const files = fs.readdirSync(SSG_DIR).filter(f => f.endsWith('.html'))

if (files.length === 0) {
	console.log(`[SSG Gallery] ⚠️ No .html snapshots found in ${SSG_DIR}`)
	process.exit(0)
}

let navHtml = ''
let snippetData = {}

for (const file of files) {
	const name = file.replace('.html', '')
	const content = fs.readFileSync(path.join(SSG_DIR, file), 'utf-8')
	snippetData[name] = content

	navHtml += `<button class="nav-btn" data-target="${name}">${name}</button>`
}

// Ensure public directory exists
const publicDir = path.dirname(OUT_FILE)
if (!fs.existsSync(publicDir)) {
	fs.mkdirSync(publicDir, { recursive: true })
}

const viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>SSG Gallery Viewer</title>
	<style>
		:root {
			--bg: #f8f9fa;
			--nav-bg: #e9ecef;
			--accent: #0d6efd;
			--text: #212529;
		}
		@media (prefers-color-scheme: dark) {
			:root {
				--bg: #212529;
				--nav-bg: #343a40;
				--accent: #0d6efd;
				--text: #f8f9fa;
			}
		}
		body {
			margin: 0;
			font-family: system-ui, -apple-system, sans-serif;
			background: var(--bg);
			color: var(--text);
			display: flex;
			height: 100vh;
			overflow: hidden;
		}
		aside {
			width: 280px;
			background: var(--nav-bg);
			border-right: 1px solid rgba(128,128,128,0.2);
			display: flex;
			flex-direction: column;
		}
		.nav-header {
			padding: 1rem;
			font-weight: 600;
			border-bottom: 1px solid rgba(128,128,128,0.2);
		}
		.nav-btns {
			display: flex;
			flex-direction: column;
			gap: 4px;
			padding: 1rem;
			overflow-y: auto;
		}
		.nav-btn {
			padding: 0.5rem 1rem;
			text-align: left;
			background: transparent;
			border: 1px solid transparent;
			color: inherit;
			cursor: pointer;
			border-radius: 4px;
		}
		.nav-btn:hover {
			background: rgba(128,128,128,0.1);
		}
		.nav-btn.active {
			background: var(--accent);
			color: white;
		}
		main {
			flex: 1;
			display: flex;
			flex-direction: column;
		}
		.toolbar {
			padding: 1rem;
			border-bottom: 1px solid rgba(128,128,128,0.2);
			display: flex;
			gap: 1rem;
			align-items: center;
		}
		.iframe-container {
			flex: 1;
			background: #e0e0e0;
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 2rem;
			overflow: auto;
		}
		iframe {
			background: white;
			border: none;
			box-shadow: 0 4px 12px rgba(0,0,0,0.1);
			transition: width 0.3s ease, height 0.3s ease;
		}
	</style>
</head>
<body>
	<aside>
		<div class="nav-header">⚡ SSG Gallery</div>
		<div class="nav-btns">${navHtml}</div>
	</aside>
	<main>
		<div class="toolbar">
			<label>
				Viewport:
				<select id="viewport-select">
					<option value="375x812">Mobile (375x812)</option>
					<option value="768x1024">Tablet (768x1024)</option>
					<option value="1200x800" selected>Desktop (1200x800)</option>
				</select>
			</label>
			<label>
				Theme:
				<select id="theme-select">
					<option value="light">Light ☀️</option>
					<option value="dark">Dark 🌙</option>
				</select>
			</label>
		</div>
		<div class="iframe-container">
			<iframe id="viewer" width="1200" height="800"></iframe>
		</div>
	</main>

	<script>
		const snippets = ${JSON.stringify(snippetData)};
		const viewer = document.getElementById('viewer');
		const vSelect = document.getElementById('viewport-select');
		const tSelect = document.getElementById('theme-select');
		const btns = document.querySelectorAll('.nav-btn');

		let currentTarget = null;

		function render() {
			if (!currentTarget || !snippets[currentTarget]) return;
			
			const theme = tSelect.value;
			const [w, h] = vSelect.value.split('x');
			
			viewer.width = w;
			viewer.height = h;

			const html = \`<!DOCTYPE html>
<html lang="en" data-bs-theme="\${theme}">
<head>
	<meta charset="UTF-8">
	<!-- For development viewer, we can point to the unbundled source CSS -->
	<link rel="stylesheet" href="/src/ui/comment.css">
	<style>
		body { 
			margin: 0; min-height: 100vh;
			display: flex; align-items: center; justify-content: center;
			background: var(--nan0-comment-bg, #fff);
			position: relative;
		}
		html[data-bs-theme="dark"] body {
			background: #1e1e1e;
		}
	</style>
</head>
<body>
	\${snippets[currentTarget]}
</body>
</html>\`;
			viewer.srcdoc = html;
		}

		btns.forEach(btn => {
			btn.addEventListener('click', () => {
				btns.forEach(b => b.classList.remove('active'));
				btn.classList.add('active');
				currentTarget = btn.dataset.target;
				render();
			});
		});

		vSelect.addEventListener('change', render);
		tSelect.addEventListener('change', render);

		// Init first
		if (btns.length > 0) {
			btns[0].click();
		}
	</script>
</body>
</html>`

fs.writeFileSync(OUT_FILE, viewerHtml)
console.log(`[SSG Gallery] ✅ Generated viewer at ${OUT_FILE}`)
