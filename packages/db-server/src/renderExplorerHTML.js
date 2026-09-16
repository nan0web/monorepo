import { ExplorerModel } from './ExplorerModel.js'

/**
 * Render Web Explorer HTML with Collapsible Interactive Tree Inspector and Global Recursive Search.
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
			--tree-key: #79c0ff;
			--tree-str: #a5d6ff;
			--tree-num: #ffa657;
			--tree-bool: #ff7b72;
			--tree-null: #8b949e;
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
			overflow-x: auto;
			white-space: nowrap;
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
			align-items: center;
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
			width: 340px;
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
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		.search-container {
			padding: 8px 12px;
			border-bottom: 1px solid var(--border);
			background: var(--bg);
			display: flex;
			gap: 6px;
			align-items: center;
		}

		.search-input {
			flex-grow: 1;
			background: var(--panel);
			color: var(--text-bright);
			border: 1px solid var(--border);
			border-radius: 6px;
			padding: 6px 10px;
			font-family: var(--font-mono);
			font-size: 0.8rem;
			outline: none;
			transition: border-color 0.15s;
		}

		.search-input:focus {
			border-color: var(--accent);
		}

		.btn-icon-toggle {
			padding: 6px 10px;
			border-radius: 6px;
			font-size: 0.8rem;
			font-weight: 600;
			background: var(--panel);
			border: 1px solid var(--border);
			color: var(--text-dim);
			cursor: pointer;
		}

		.btn-icon-toggle.active {
			background: var(--accent);
			color: #0d1117;
			border-color: var(--accent);
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
		.file-subpath { font-size: 0.72rem; color: var(--text-dim); display: block; }

		.editor-container {
			flex-grow: 1;
			display: flex;
			flex-direction: column;
			background: var(--bg);
			overflow: hidden;
		}

		.editor-toolbar {
			background: var(--panel);
			border-bottom: 1px solid var(--border);
			padding: 8px 16px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			flex-wrap: wrap;
			gap: 8px;
		}

		.active-doc-info {
			font-family: var(--font-mono);
			font-size: 0.85rem;
			color: var(--accent);
			display: flex;
			align-items: center;
			gap: 12px;
		}

		.tab-buttons {
			display: flex;
			gap: 4px;
			background: var(--bg);
			padding: 3px;
			border-radius: 6px;
			border: 1px solid var(--border);
		}

		.tab-btn {
			padding: 5px 12px;
			font-size: 0.8rem;
			font-weight: 500;
			background: transparent;
			border: none;
			color: var(--text-dim);
			border-radius: 4px;
			cursor: pointer;
			transition: all 0.15s;
		}

		.tab-btn.active {
			background: var(--panel-hover);
			color: var(--text-bright);
			font-weight: 600;
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

		/* Interactive Collapsible Tree Styles */
		.tree-inspector-container {
			flex-grow: 1;
			background: var(--bg);
			padding: 16px 20px;
			overflow: auto;
			font-family: var(--font-mono);
			font-size: 0.85rem;
			line-height: 1.6;
		}

		.tree-node {
			margin-left: 18px;
			border-left: 1px dashed rgba(255,255,255,0.12);
			padding-left: 8px;
		}

		.tree-header {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			cursor: pointer;
			user-select: none;
			padding: 2px 4px;
			border-radius: 4px;
			transition: background 0.1s;
		}

		.tree-header:hover {
			background: var(--panel-hover);
		}

		.tree-toggle {
			display: inline-block;
			width: 14px;
			height: 14px;
			line-height: 14px;
			text-align: center;
			font-size: 0.75rem;
			color: var(--text-dim);
			transition: transform 0.15s ease;
		}

		.tree-toggle.collapsed {
			transform: rotate(-90deg);
		}

		.tree-key { color: var(--tree-key); font-weight: 600; }
		.tree-colon { color: var(--text-dim); }
		.tree-type-badge {
			font-size: 0.72rem;
			color: var(--text-dim);
			background: var(--panel);
			padding: 1px 6px;
			border-radius: 4px;
			border: 1px solid var(--border);
		}

		.tree-val-str { color: var(--tree-str); }
		.tree-val-num { color: var(--tree-num); }
		.tree-val-bool { color: var(--tree-bool); font-weight: 600; }
		.tree-val-null { color: var(--tree-null); font-style: italic; }

		.tree-actions-bar {
			display: flex;
			gap: 8px;
			margin-bottom: 12px;
			padding-bottom: 8px;
			border-bottom: 1px solid var(--border);
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
			<div class="panel-header">
				<span>${m.filesPanelTitle}</span>
				<button class="btn-icon-toggle" id="btnGlobalSearch" onclick="toggleGlobalSearch()" title="${m.searchGlobal}">🌐 Всюди</button>
			</div>
			<div class="search-container">
				<input type="text" id="searchInput" class="search-input" placeholder="${m.searchPlaceholder}" oninput="onSearchInput(this.value)" />
			</div>
			<ul class="file-list" id="fileList"></ul>
		</div>

		<div class="editor-container">
			<div class="editor-toolbar" id="editorToolbar">
				<div class="active-doc-info" id="activeDocInfo">
					<span>${m.editorNoFile}</span>
				</div>
				<div class="actions">
					<div class="tab-buttons" id="viewTabs" style="display:none;">
						<button class="tab-btn active" id="tabRawBtn" onclick="switchEditorTab('raw')">${m.tabRaw}</button>
						<button class="tab-btn" id="tabTreeBtn" onclick="switchEditorTab('tree')">${m.tabTree}</button>
					</div>
					<button class="danger" id="btnDelete" onclick="deleteActiveFile()" style="display:none;">${m.deleteButton}</button>
				</div>
			</div>

			<textarea id="editor" placeholder="${m.noFileSelected}" disabled></textarea>
			
			<div id="treeInspector" class="tree-inspector-container" style="display:none;">
				<div class="tree-actions-bar">
					<button onclick="expandAllTreeNodes()">➕ Розгорнути все</button>
					<button onclick="collapseAllTreeNodes()">➖ Згорнути все</button>
				</div>
				<div id="treeRoot"></div>
			</div>

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
			searchPlaceholder: ${JSON.stringify(m.searchPlaceholder)},
			fileInfoSize: ${JSON.stringify(m.fileInfoSize)},
			tabRaw: ${JSON.stringify(m.tabRaw)},
			tabTree: ${JSON.stringify(m.tabTree)},
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
		let activeDocData = null;
		let activeTab = 'raw';
		let viewMode = localStorage.getItem('nan0db-explorer-view-mode') || 'fetch';
		let isGlobalSearch = false;
		let searchDebounceTimer = null;

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
			if (activeFileUri) loadFile(activeFileUri);
		}

		function toggleGlobalSearch() {
			isGlobalSearch = !isGlobalSearch;
			const btn = document.getElementById('btnGlobalSearch');
			if (isGlobalSearch) btn.classList.add('active');
			else btn.classList.remove('active');
			const query = document.getElementById('searchInput').value;
			onSearchInput(query);
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
			let html = '<span class="breadcrumb-item" onclick="loadDir(\\'\\')">' + I18N.breadcrumbsRoot + '</span>';
			let accum = '';

			for (const part of parts) {
				accum += (accum ? '/' : '') + part;
				const p = accum;
				html += ' <span class="breadcrumb-sep">/</span> <span class="breadcrumb-item" onclick="loadDir(\\'' + p + '\\')">' + part + '</span>';
			}
			container.innerHTML = html;
		}

		let currentEntries = [];
		let searchQuery = '';

		function filterFiles(query) {
			onSearchInput(query);
		}

		function onSearchInput(query) {
			searchQuery = (query || '').toLowerCase().trim();
			clearTimeout(searchDebounceTimer);

			if (isGlobalSearch && searchQuery) {
				setStatus('Пошук по всіх папках: ' + searchQuery + '...');
				searchDebounceTimer = setTimeout(async () => {
					try {
						const res = await fetch('/api/search?q=' + encodeURIComponent(searchQuery));
						if (!res.ok) throw new Error('Помилка глобального пошуку');
						const results = await res.json();
						renderFileList(results, true);
						setStatus(t(I18N.statusLoadedCount, { count: results.length }));
					} catch (err) {
						setStatus('Помилка пошуку: ' + err.message, true);
					}
				}, 250);
			} else {
				renderFileList();
			}
		}

		function renderFileList(entries, isGlobalList = false) {
			if (Array.isArray(entries)) currentEntries = entries;
			else entries = currentEntries;

			const list = document.getElementById('fileList');
			list.innerHTML = '';

			if (currentPath && !isGlobalList && !isGlobalSearch) {
				const parentPath = currentPath.split('/').slice(0, -1).join('/');
				const li = document.createElement('li');
				li.className = 'file-item';
				li.innerHTML = '<span class="file-icon">📁</span> <span>..</span>';
				li.onclick = () => loadDir(parentPath);
				list.appendChild(li);
			}

			const visibleEntries = (!isGlobalList && searchQuery)
				? entries.filter(e => {
					const raw = typeof e === 'string' ? e : (e.name || e.path || '');
					return raw.toLowerCase().includes(searchQuery);
				})
				: entries;

			visibleEntries.forEach(entry => {
				let rawName = typeof entry === 'string' ? entry : (entry.name || entry.path || '');
				if (!rawName) return;

				const isDir = Boolean(entry.isDirectory || entry.isDir || entry.stat?.isDirectory || rawName.endsWith('/'));
				if (rawName.endsWith('/')) rawName = rawName.slice(0, -1);
				
				const fullPath = entry.path || (currentPath ? currentPath + '/' + rawName : rawName);
				const displayName = rawName.includes('/') ? rawName.split('/').pop() : rawName;
				const icon = isDir ? '📁' : '📄';

				const li = document.createElement('li');
				li.className = 'file-item';
				if (activeFileUri === fullPath) {
					li.classList.add('active');
				}

				if (isGlobalList || isGlobalSearch) {
					li.innerHTML = '<span class="file-icon">' + icon + '</span> <div><strong>' + displayName + '</strong><span class="file-subpath">' + fullPath + '</span></div>';
				} else {
					li.innerHTML = '<span class="file-icon">' + icon + '</span> <span>' + displayName + '</span>';
				}

				li.onclick = () => {
					if (isDir) {
						loadDir(fullPath);
					} else {
						loadFile(fullPath);
					}
				};

				list.appendChild(li);
			});
		}

		function formatBytes(bytes) {
			if (!bytes || bytes === 0) return '0 B';
			const k = 1024;
			const sizes = ['B', 'KB', 'MB', 'GB'];
			const i = Math.floor(Math.log(bytes) / Math.log(k));
			return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
		}

		function encodePath(uri) {
			return uri.split('/').map(part => encodeURIComponent(part)).join('/')
		}

		async function loadFile(uri) {
			activeFileUri = uri;
			setStatus(t(I18N.statusLoadingFile, { uri }));
			renderFileList();

			try {
				const [res, statRes] = await Promise.all([
					fetch('/api/documents/' + encodePath(uri) + '?mode=' + viewMode),
					fetch('/api/stat/' + encodePath(uri)).catch(() => null)
				]);
				if (!res.ok) throw new Error('Failed to fetch document');
				const data = await res.json();
				activeDocData = data;

				let sizeText = '';
				if (statRes && statRes.ok) {
					const statData = await statRes.json();
					if (statData && statData.size !== undefined) {
						sizeText = ' (' + formatBytes(statData.size) + ')';
					}
				}

				const editor = document.getElementById('editor');
				editor.value = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
				editor.disabled = false;

				document.getElementById('emptyState').style.display = 'none';
				document.getElementById('viewTabs').style.display = (typeof data === 'object' && data !== null) ? 'inline-flex' : 'none';
				document.getElementById('activeDocInfo').innerText = uri + sizeText;
				document.getElementById('btnDelete').style.display = 'inline-flex';

				renderTreeInspector(data);
				switchEditorTab(activeTab);

				setStatus(t(I18N.statusFileLoaded, { uri }));
			} catch (err) {
				setStatus(t(I18N.statusFileLoadError, { error: err.message }), true);
			}
		}

		function switchEditorTab(tab) {
			activeTab = tab;
			const rawBtn = document.getElementById('tabRawBtn');
			const treeBtn = document.getElementById('tabTreeBtn');
			const editorEl = document.getElementById('editor');
			const treeEl = document.getElementById('treeInspector');

			if (tab === 'tree' && activeDocData && typeof activeDocData === 'object') {
				treeBtn.classList.add('active');
				rawBtn.classList.remove('active');
				editorEl.style.display = 'none';
				treeEl.style.display = 'block';
			} else {
				rawBtn.classList.add('active');
				treeBtn.classList.remove('active');
				editorEl.style.display = 'block';
				treeEl.style.display = 'none';
			}
		}

		/* Collapsible Interactive JSON Tree Renderer */
		function renderTreeInspector(data) {
			const container = document.getElementById('treeRoot');
			container.innerHTML = '';
			if (data === null || typeof data !== 'object') {
				container.innerHTML = renderPrimitive(data);
				return;
			}
			const rootNode = createTreeNode(null, data, true);
			container.appendChild(rootNode);
		}

		function createTreeNode(key, value, isRoot = false) {
			const isArray = Array.isArray(value);
			const isObj = value !== null && typeof value === 'object';

			const wrapper = document.createElement('div');
			if (!isRoot) wrapper.className = 'tree-node';

			if (isObj) {
				const header = document.createElement('div');
				header.className = 'tree-header';

				const toggle = document.createElement('span');
				toggle.className = 'tree-toggle';
				toggle.innerHTML = '▼';

				let keyLabel = '';
				if (key !== null) {
					keyLabel = '<span class="tree-key">' + escapeHtml(key) + '</span><span class="tree-colon">: </span>';
				}

				const count = isArray ? value.length : Object.keys(value).length;
				const badge = '<span class="tree-type-badge">' + (isArray ? '[' + count + ']' : '{' + count + '}') + '</span>';

				header.innerHTML = keyLabel + badge;
				header.prepend(toggle);

				const childrenContainer = document.createElement('div');
				childrenContainer.className = 'tree-children';

				const entries = isArray ? value.map((v, i) => [i, v]) : Object.entries(value);
				entries.forEach(([k, v]) => {
					childrenContainer.appendChild(createTreeNode(k, v, false));
				});

				header.onclick = (e) => {
					e.stopPropagation();
					const isCollapsed = childrenContainer.style.display === 'none';
					childrenContainer.style.display = isCollapsed ? 'block' : 'none';
					toggle.classList.toggle('collapsed', !isCollapsed);
				};

				wrapper.appendChild(header);
				wrapper.appendChild(childrenContainer);
			} else {
				const item = document.createElement('div');
				item.style.padding = '2px 0';
				let keyLabel = '';
				if (key !== null) {
					keyLabel = '<span class="tree-key">' + escapeHtml(key) + '</span><span class="tree-colon">: </span>';
				}
				item.innerHTML = keyLabel + renderPrimitive(value);
				wrapper.appendChild(item);
			}

			return wrapper;
		}

		function renderPrimitive(val) {
			if (typeof val === 'string') {
				return '<span class="tree-val-str">"' + escapeHtml(val) + '"</span>';
			} else if (typeof val === 'number') {
				return '<span class="tree-val-num">' + val + '</span>';
			} else if (typeof val === 'boolean') {
				return '<span class="tree-val-bool">' + val + '</span>';
			} else if (val === null) {
				return '<span class="tree-val-null">null</span>';
			} else if (val === undefined) {
				return '<span class="tree-val-null">undefined</span>';
			}
			return escapeHtml(String(val));
		}

		function escapeHtml(str) {
			return String(str)
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;');
		}

		function expandAllTreeNodes() {
			document.querySelectorAll('.tree-children').forEach(el => el.style.display = 'block');
			document.querySelectorAll('.tree-toggle').forEach(el => el.classList.remove('collapsed'));
		}

		function collapseAllTreeNodes() {
			document.querySelectorAll('.tree-children').forEach(el => el.style.display = 'none');
			document.querySelectorAll('.tree-toggle').forEach(el => el.classList.add('collapsed'));
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
				activeDocData = parsedData;
				renderTreeInspector(parsedData);
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
				activeDocData = null;
				document.getElementById('editor').value = '';
				document.getElementById('editor').disabled = true;
				document.getElementById('treeRoot').innerHTML = '';
				document.getElementById('viewTabs').style.display = 'none';
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
