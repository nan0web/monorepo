import { ExplorerModel } from './ExplorerModel.js'

/**
 * Render Web Explorer HTML using ExplorerModel for i18n localization.
 * @param {{ model?: ExplorerModel, lang?: string }} [options]
 * @returns {string} HTML markup
 */
export const renderExplorerHTML = (options = {}) => {
	const m = options.model || new ExplorerModel()
	const lang = options.lang || 'uk'

	return `<!DOCTYPE html>
<html lang="${lang}">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${m.brand}</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
	<style>
		:root {
			--bg: #0d1117;
			--panel: #161b22;
			--panel-hover: #1f242d;
			--border: #30363d;
			--accent: #58a6ff;
			--accent-glow: rgba(88, 166, 255, 0.15);
			--success: #3fb950;
			--danger: #f85149;
			--text: #c9d1d9;
			--text-dim: #8b949e;
			--text-bright: #f0f6fc;
			--font-sans: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
			--font-mono: 'JetBrains Mono', monospace;
		}

		* { box-sizing: border-box; margin: 0; padding: 0; }

		body {
			background-color: var(--bg);
			color: var(--text);
			font-family: var(--font-sans);
			display: flex;
			flex-direction: column;
			height: 100vh;
			overflow: hidden;
		}

		header {
			background: var(--panel);
			border-bottom: 1px solid var(--border);
			padding: 12px 20px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			box-shadow: 0 4px 12px rgba(0,0,0,0.3);
			z-index: 10;
		}

		.brand {
			display: flex;
			align-items: center;
			gap: 12px;
			font-weight: 700;
			font-size: 1.1rem;
			color: var(--text-bright);
			letter-spacing: -0.5px;
		}

		.brand-icon {
			font-size: 1.5rem;
			background: var(--accent-glow);
			padding: 6px;
			border-radius: 8px;
			border: 1px solid rgba(88, 166, 255, 0.3);
		}

		.path-breadcrumbs {
			display: flex;
			align-items: center;
			gap: 6px;
			font-family: var(--font-mono);
			font-size: 0.9rem;
			background: var(--bg);
			padding: 6px 14px;
			border-radius: 6px;
			border: 1px solid var(--border);
			flex-grow: 1;
			max-width: 600px;
			margin: 0 20px;
		}

		.breadcrumb-item {
			color: var(--accent);
			cursor: pointer;
			text-decoration: none;
			transition: color 0.15s;
		}

		.breadcrumb-item:hover {
			color: var(--text-bright);
			text-decoration: underline;
		}

		.breadcrumb-sep { color: var(--text-dim); }

		.actions {
			display: flex;
			gap: 10px;
		}

		.view-mode {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			color: var(--text-dim);
			font-size: 0.85rem;
			white-space: nowrap;
		}

		.view-mode select {
			background: var(--bg);
			color: var(--text);
			border: 1px solid var(--border);
			padding: 7px 9px;
			border-radius: 6px;
			font-family: var(--font-sans);
			font-size: 0.85rem;
			cursor: pointer;
		}

		button {
			background: var(--panel);
			color: var(--text);
			border: 1px solid var(--border);
			padding: 7px 14px;
			border-radius: 6px;
			font-family: var(--font-sans);
			font-weight: 500;
			font-size: 0.85rem;
			cursor: pointer;
			display: inline-flex;
			align-items: center;
			gap: 6px;
			transition: all 0.2s ease;
		}

		button:hover {
			background: var(--panel-hover);
			color: var(--text-bright);
			border-color: var(--accent);
		}

		button.primary {
			background: var(--accent);
			color: #0d1117;
			border-color: var(--accent);
			font-weight: 600;
		}

		button.primary:hover {
			background: #79c0ff;
			box-shadow: 0 0 12px var(--accent-glow);
		}

		button.danger:hover {
			background: var(--danger);
			color: #fff;
			border-color: var(--danger);
		}

		main {
			display: flex;
			flex-grow: 1;
			overflow: hidden;
		}

		.tree-panel {
			width: 320px;
			background: var(--panel);
			border-right: 1px solid var(--border);
			display: flex;
			flex-direction: column;
			flex-shrink: 0;
		}

		.panel-header {
			padding: 10px 14px;
			font-size: 0.8rem;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			color: var(--text-dim);
			border-bottom: 1px solid var(--border);
			background: rgba(0,0,0,0.15);
		}

		.file-list {
			flex-grow: 1;
			overflow-y: auto;
			list-style: none;
		}

		.file-item {
			display: flex;
			align-items: center;
			gap: 10px;
			padding: 8px 14px;
			font-family: var(--font-mono);
			font-size: 0.85rem;
			cursor: pointer;
			border-bottom: 1px solid rgba(255,255,255,0.03);
			transition: background 0.15s;
			user-select: none;
		}

		.file-item:hover {
			background: var(--panel-hover);
		}

		.file-item.active {
			background: var(--accent-glow);
			border-left: 3px solid var(--accent);
			color: var(--text-bright);
		}

		.file-icon { font-size: 1rem; width: 20px; text-align: center; }

		.editor-container {
			flex-grow: 1;
			display: flex;
			flex-direction: column;
			background: var(--bg);
		}

		.editor-toolbar {
			background: var(--panel);
			border-bottom: 1px solid var(--border);
			padding: 8px 16px;
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		.active-doc-info {
			font-family: var(--font-mono);
			font-size: 0.85rem;
			color: var(--accent);
		}

		textarea#editor {
			flex-grow: 1;
			background: var(--bg);
			color: var(--text-bright);
			font-family: var(--font-mono);
			font-size: 0.9rem;
			line-height: 1.5;
			padding: 16px;
			border: none;
			outline: none;
			resize: none;
			white-space: pre;
			tab-size: 2;
		}

		.empty-state {
			flex-grow: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			color: var(--text-dim);
			gap: 12px;
		}

		.empty-icon { font-size: 3rem; opacity: 0.5; }

		.status-bar {
			background: var(--panel);
			border-top: 1px solid var(--border);
			padding: 6px 16px;
			font-size: 0.78rem;
			font-family: var(--font-mono);
			color: var(--text-dim);
			display: flex;
			justify-content: space-between;
		}
	</style>
</head>
<body>
	<header>
		<div class="brand">
			<span class="brand-icon">📡</span>
			<span>${m.brand}</span>
		</div>
		<div class="path-breadcrumbs" id="breadcrumbs">
			<span class="breadcrumb-item" onclick="loadDir('')">${m.breadcrumbsRoot}</span>
		</div>
		<div class="actions">
			<label class="view-mode" for="viewMode">Mode:
				<select id="viewMode" onchange="setViewMode(this.value)">
					<option value="fetch">${m.viewModeFetch}</option>
					<option value="get">${m.viewModeGet}</option>
				</select>
			</label>
			<button onclick="refreshCurrentDir()">${m.refreshButton}</button>
			<button class="primary" onclick="saveActiveFile()">${m.saveButton}</button>
		</div>
	</header>

	<main>
		<div class="tree-panel">
			<div class="panel-header">${m.filesPanelTitle}</div>
			<ul class="file-list" id="fileList"></ul>
		</div>

		<div class="editor-container">
			<div class="editor-toolbar" id="editorToolbar">
				<div class="active-doc-info" id="activeDocInfo">${m.editorNoFile}</div>
				<div class="actions">
					<button class="danger" id="btnDelete" onclick="deleteActiveFile()" style="display:none;">${m.deleteButton}</button>
				</div>
			</div>
			<textarea id="editor" placeholder="${m.noFileSelected}" disabled></textarea>
			<div class="empty-state" id="emptyState">
				<span class="empty-icon">📁</span>
				<div>${m.emptyStatePrompt}</div>
			</div>
		</div>
	</main>

	<div class="status-bar">
		<span id="statusMessage">${m.statusReady}</span>
		<span>REST API Mode</span>
	</div>

	<script id="explorerScript">
		const I18N = {
			breadcrumbsRoot: ${JSON.stringify(m.breadcrumbsRoot)},
			statusReady: ${JSON.stringify(m.statusReady)},
			statusLoadingDir: ${JSON.stringify(m.statusLoadingDir)},
			statusLoadError: ${JSON.stringify(m.statusLoadError)},
			statusLoadedCount: ${JSON.stringify(m.statusLoadedCount)},
			statusLoadingFile: ${JSON.stringify(m.statusLoadingFile)},
			statusFileLoaded: ${JSON.stringify(m.statusFileLoaded)},
			statusFileLoadError: ${JSON.stringify(m.statusFileLoadError)},
			statusSavingFile: ${JSON.stringify(m.statusSavingFile)},
			statusSaved: ${JSON.stringify(m.statusSaved)},
			statusSaveError: ${JSON.stringify(m.statusSaveError)},
			statusDeleted: ${JSON.stringify(m.statusDeleted)},
			statusDeleteError: ${JSON.stringify(m.statusDeleteError)},
			confirmDelete: ${JSON.stringify(m.confirmDelete)},
			editorNoFile: ${JSON.stringify(m.editorNoFile)}
		};

		let currentPath = '';
		let activeFileUri = null;
		let viewMode = localStorage.getItem('nan0db-explorer-view-mode') || 'fetch';

		function t(tmpl, vars = {}) {
			let str = String(tmpl);
			for (const [k, v] of Object.entries(vars)) {
				str = str.replace(new RegExp('{{\\s*' + k + '\\s*}}', 'g'), String(v));
			}
			return str;
		}

		function setViewMode(mode) {
			viewMode = mode === 'get' ? 'get' : 'fetch';
			localStorage.setItem('nan0db-explorer-view-mode', viewMode);
			document.getElementById('viewMode').value = viewMode;
			setStatus('View Mode: ' + viewMode);
		}

		async function loadDir(path = '') {
			currentPath = path.endsWith('/') ? path.slice(0, -1) : path;
			renderBreadcrumbs();
			setStatus(I18N.statusLoadingDir);

			try {
				const targetPath = currentPath ? encodePath(currentPath) : '.';
				const res = await fetch(\`/api/directory/\${targetPath}\`);
				if (!res.ok) throw new Error(I18N.statusLoadError);
				const entries = await res.json();
				renderFileList(entries);
				setStatus(t(I18N.statusLoadedCount, { count: entries.length }));
			} catch (err) {
				setStatus(I18N.statusLoadError + ': ' + err.message, true);
			}
		}

		function renderBreadcrumbs() {
			const container = document.getElementById('breadcrumbs');
			const parts = currentPath.split('/').filter(Boolean);
			let html = \`<span class="breadcrumb-item" onclick="loadDir('')">\${I18N.breadcrumbsRoot}</span>\`;
			let accum = '';

			for (const part of parts) {
				accum += (accum ? '/' : '') + part;
				const p = accum;
				html += \` <span class="breadcrumb-sep">/</span> <span class="breadcrumb-item" onclick="loadDir('\\\`\${p}\\\`')">\${part}</span>\`;
			}
			container.innerHTML = html;
		}

		let currentEntries = [];

		function renderFileList(entries) {
			if (Array.isArray(entries)) currentEntries = entries;
			else entries = currentEntries;

			const list = document.getElementById('fileList');
			list.innerHTML = '';

			if (currentPath) {
				const parentPath = currentPath.split('/').slice(0, -1).join('/');
				const li = document.createElement('li');
				li.className = 'file-item';
				li.innerHTML = '<span class="file-icon">📁</span> <span>..</span>';
				li.onclick = () => loadDir(parentPath);
				list.appendChild(li);
			}

			entries.forEach(entry => {
				let rawName = typeof entry === 'string' ? entry : (entry.name || entry.path || '');
				if (!rawName) return;

				const isDir = Boolean(entry.isDirectory || entry.isDir || entry.stat?.isDirectory || rawName.endsWith('/'));
				if (rawName.endsWith('/')) rawName = rawName.slice(0, -1);
				const name = rawName.includes('/') ? rawName.split('/').pop() : rawName;
				const icon = isDir ? '📁' : '📄';

				const li = document.createElement('li');
				li.className = 'file-item';
				const itemUri = currentPath ? currentPath + '/' + name : name;
				if (activeFileUri === itemUri) {
					li.classList.add('active');
				}

				li.innerHTML = \`<span class="file-icon">\${icon}</span> <span>\${name}</span>\`;

				li.onclick = () => {
					if (isDir) {
						loadDir(itemUri);
					} else {
						loadFile(itemUri);
					}
				};

				list.appendChild(li);
			});
		}

		function encodePath(uri) {
			return uri.split('/').map(part => encodeURIComponent(part)).join('/')
		}

		async function loadFile(uri) {
			activeFileUri = uri;
			setStatus(t(I18N.statusLoadingFile, { uri }));
			renderFileList();

			try {
				const res = await fetch(\`/api/documents/\${encodePath(uri)}?mode=\${viewMode}\`);
				if (!res.ok) throw new Error('Failed to fetch document');
				const data = await res.json();

				const editor = document.getElementById('editor');
				editor.value = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
				editor.disabled = false;

				document.getElementById('emptyState').style.display = 'none';
				document.getElementById('editor').style.display = 'block';
				document.getElementById('activeDocInfo').innerText = uri;
				document.getElementById('btnDelete').style.display = 'inline-flex';

				setStatus(t(I18N.statusFileLoaded, { uri }));
			} catch (err) {
				setStatus(t(I18N.statusFileLoadError, { error: err.message }), true);
			}
		}

		async function saveActiveFile() {
			if (!activeFileUri) return;
			setStatus(t(I18N.statusSavingFile, { uri: activeFileUri }));

			const editor = document.getElementById('editor');
			let parsedData;
			try {
				parsedData = JSON.parse(editor.value);
			} catch (e) {
				parsedData = editor.value;
			}

			try {
				const res = await fetch(\`/api/documents/\${encodePath(activeFileUri)}\`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(parsedData)
				});
				if (!res.ok) throw new Error('Save failed');
				setStatus(t(I18N.statusSaved, { uri: activeFileUri }));
			} catch (err) {
				setStatus(t(I18N.statusSaveError, { error: err.message }), true);
			}
		}

		async function deleteActiveFile() {
			if (!activeFileUri || !confirm(t(I18N.confirmDelete, { uri: activeFileUri }))) return;
			try {
				const res = await fetch(\`/api/documents/\${encodePath(activeFileUri)}\`, { method: 'DELETE' });
				if (!res.ok) throw new Error('Delete failed');
				setStatus(t(I18N.statusDeleted, { uri: activeFileUri }));
				activeFileUri = null;
				document.getElementById('editor').value = '';
				document.getElementById('editor').disabled = true;
				document.getElementById('btnDelete').style.display = 'none';
				document.getElementById('activeDocInfo').innerText = I18N.editorNoFile;
				refreshCurrentDir();
			} catch (err) {
				setStatus(t(I18N.statusDeleteError, { error: err.message }), true);
			}
		}

		function refreshCurrentDir() { loadDir(currentPath); }

		function setStatus(msg, isError = false) {
			const el = document.getElementById('statusMessage');
			el.innerText = msg;
			el.style.color = isError ? 'var(--danger)' : 'var(--text-dim)';
		}

		document.addEventListener('keydown', (e) => {
			if ((e.ctrlKey || e.metaKey) && e.key === 's') {
				e.preventDefault();
				saveActiveFile();
			}
		});

		setViewMode(viewMode);
		loadDir('');
	</script>
</body>
</html>`
}
