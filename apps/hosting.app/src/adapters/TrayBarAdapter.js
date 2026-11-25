/**
 * Default template translator when no i18n function is provided.
 * @param {string} tpl
 * @param {Record<string, unknown>} [vars]
 * @returns {string}
 */
function defaultT(tpl, vars = {}) {
	return String(tpl).replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`))
}

/**
 * Escape pipe characters in SwiftBar/Argos menu labels or params so each line has at most one "|".
 * @param {string} value
 * @returns {string}
 */
function sanitizePipe(value) {
	return String(value ?? '').replace(/\|/g, '/')
}

/**
 * Format a single SwiftBar/Argos menu line with optional parameters.
 * @param {string} label
 * @param {string} [params]
 * @returns {string}
 */
function formatLine(label, params = '') {
	const safeLabel = sanitizePipe(label)
	const safeParams = sanitizePipe(params).trim()
	return safeParams ? `${safeLabel} | ${safeParams}` : safeLabel
}

/**
 * Build SwiftBar bash command parameters using bin or node invocation mode.
 * @param {object} state
 * @param {string[]} args
 * @param {string} [extra]
 * @returns {string}
 */
function buildCmd(state, args, extra = 'terminal=false refresh=true') {
	const binPath = state.binPath || 'nan0host'
	const binMode = state.binMode || 'bin'
	const nodePath = state.nodePath || 'node'
	const fullArgs = binMode === 'node' ? [binPath, ...args] : args
	const bashBin = binMode === 'node' ? nodePath : binPath
	const params = fullArgs.map((arg, idx) => `param${idx + 1}=${arg}`).join(' ')
	return [`bash=${bashBin}`, params, extra].filter(Boolean).join(' ')
}

/**
 * Render top menu bar header and proxy status lines.
 * @param {object} state
 * @param {(tpl: string, vars?: Record<string, unknown>) => string} t
 * @returns {string[]}
 */
function renderHeader(state, t) {
	const { proxyState, caddyRunning, caddyPids = [], dnsOk, errorSummary, errorLog, envDir } = state
	const hasError = Boolean(errorSummary)
	const lines = []
	const UI = TrayBarAdapter.UI

	if (proxyState) {
		const stateLabel = t(UI.states[proxyState] || '{state}...', { state: proxyState })
		lines.push(formatLine(`🟡 dev (${stateLabel})`, 'sfimage=arrow.triangle.2.circlepath color=#f59e0b'))
		lines.push('---', formatLine(t(UI.proxyState, { state: stateLabel }), 'font=bold'))
	} else if (caddyRunning) {
		const warn = hasError || !dnsOk ? ' ⚠️' : ''
		lines.push(formatLine(`🟢 dev${warn}`, 'sfimage=network.badge.shield.half.filled'))
		lines.push('---', formatLine(t(UI.proxyRunning, { pids: caddyPids.join(' ') }), 'font=bold'))
	} else if (hasError) {
		lines.push(formatLine('🔴 dev', 'sfimage=exclamationmark.triangle.fill color=#ff3b30'))
		lines.push('---', formatLine(t(UI.proxyStoppedError), 'font=bold'))
	} else {
		lines.push(formatLine('⚪️ dev', 'sfimage=network.slash color=#888888'))
		lines.push('---', formatLine(t(UI.proxyStopped), 'font=bold'))
	}

	if (dnsOk) {
		lines.push(formatLine(t(UI.dnsActive), 'size=12'))
	} else {
		lines.push(formatLine(t(UI.dnsInactive), 'color=#ff3b30 size=12'))
		lines.push(formatLine(t(UI.restartDns), buildCmd(state, ['proxy', 'restart-dns', `--dir=${envDir}`])))
	}

	if (hasError) {
		lines.push('---', formatLine(`⚠️ ${errorSummary.slice(0, 80)}`, 'color=#ff3b30 size=12'))
		if (errorLog) lines.push(formatLine(t(UI.viewLastError), `bash=/usr/bin/open param1=${errorLog} terminal=false`))
		lines.push(formatLine(t(UI.clearError), buildCmd(state, ['proxy', 'clear-error', `--dir=${envDir}`])))
	}

	return lines
}

/**
 * Render header line for a single site.
 * @param {object} site
 * @param {boolean} caddyRunning
 * @param {(tpl: string, vars?: Record<string, unknown>) => string} t
 * @returns {string}
 */
function renderSiteHeader(site, caddyRunning, t) {
	const UI = TrayBarAdapter.UI
	const { domain, port, online, lockLabel, hasError } = site
	const errBadge = hasError ? ' ⚠️' : ''

	if (lockLabel) {
		const prefix = lockLabel.startsWith('⏳') ? '' : '⏳ '
		return formatLine(`🟡 ${domain} (: ${port}) [${prefix}${lockLabel}]`, 'color=#f59e0b')
	}
	if (hasError && !online) {
		return formatLine(`🔴 ${domain} (: ${port}) [${t(UI.siteErrorState)}]`, 'color=#ff3b30')
	}
	if (!caddyRunning) {
		const status = t(online ? UI.appActiveProxyOff : UI.offline)
		return formatLine(`⚪️ ${domain} (: ${port}) ${status}${errBadge}`, `color=${online ? '#aaaaaa' : '#666666'}`)
	}
	if (online) {
		return formatLine(`🟢 ${domain} (: ${port}) [${t(UI.online)}]${errBadge}`, `href=https://${domain} tooltip='${t(UI.openTooltip, { domain })}'`)
	}
	return formatLine(`⚪️ ${domain} (: ${port}) [${t(UI.offlineLabel)}]${errBadge}`, `color=#888888 tooltip='${t(UI.portNotListening, { port })}'`)
}

/**
 * Render status line and submenu actions for a single site.
 * @param {object} site
 * @param {object} state
 * @param {(tpl: string, vars?: Record<string, unknown>) => string} t
 * @returns {string[]}
 */
function renderSite(site, state, t) {
	const envDir = state.envDir || '.'
	const caddyRunning = Boolean(state.caddyRunning)
	const dockerRunning = state.dockerRunning !== false
	const UI = TrayBarAdapter.UI
	const { domain, port, online, pid, errorLog, hasError, logFile, logFiles, hasDocker, dockerUp, isBusy, dir } = site
	const lines = [renderSiteHeader(site, caddyRunning, t), formatLine(t(UI.openDomain, { domain }), `href=https://${domain}`)]

	if (hasError) {
		if (errorLog) lines.push(formatLine(t(UI.viewError), `bash=/usr/bin/open param1=${errorLog} terminal=false`))
		lines.push(formatLine(t(UI.siteClearError), buildCmd(state, ['app', 'clear-error', String(port), `--dir=${envDir}`])))
	}
	if (online) {
		lines.push(formatLine(t(UI.stopServer, { pid: pid || '?' }), buildCmd(state, ['app', 'stop', String(port), `--dir=${envDir}`])))
	} else if (dir !== false) {
		const busySuffix = t(UI.inProgress)
		const renderAction = (label, action) =>
			isBusy
				? formatLine(`${label} ${busySuffix}`, 'color=#888888')
				: formatLine(label, buildCmd(state, ['app', action, String(port), `--dir=${envDir}`]))
		lines.push(renderAction(t(UI.startDev), 'start-dev'))
		lines.push(renderAction(t(UI.startProd), 'start-prod'))
		lines.push(renderAction(t(UI.buildAndStartBg), 'build-and-start-bg'))
		lines.push(renderAction(t(UI.buildAndStartTerm), 'build-and-start'))
	}
	if (Array.isArray(logFiles) && logFiles.length > 0) {
		for (const f of logFiles) {
			lines.push(formatLine(`${t(UI.viewLog)} (${f.name})`, `bash=/usr/bin/open param1=${f.path} terminal=false`))
		}
	} else {
		const targetLog = logFile || errorLog || state.logsDir
		if (targetLog) lines.push(formatLine(t(UI.viewLog), `bash=/usr/bin/open param1=${targetLog} terminal=false`))
	}
	if (hasDocker) {
		if (!dockerRunning) {
			lines.push(formatLine(t(UI.dockerNotRunning), 'color=#ff3b30'))
			lines.push(formatLine(t(UI.startOrbStack), 'bash=/usr/bin/open param1=-a param2=OrbStack terminal=false refresh=true'))
		} else if (dockerUp === true) {
			lines.push(formatLine(t(UI.dockerRunningLabel), 'color=#22c55e'))
		} else if (dockerUp === false) {
			lines.push(formatLine(t(UI.dockerStoppedLabel), 'color=#888888'))
		}
		const dockerAction = dockerUp === true ? 'docker-down' : 'docker-up'
		const dockerLabel = dockerUp === true ? t(UI.dockerDown) : t(UI.dockerUp)
		lines.push(
			isBusy
				? formatLine(`${dockerLabel} ${t(UI.inProgress)}`, 'color=#888888')
				: formatLine(dockerLabel, buildCmd(state, ['app', dockerAction, String(port), `--dir=${envDir}`])),
		)
	}
	if (dir !== false) {
		lines.push('-- ---')
		lines.push(formatLine(t(UI.openTerminal), buildCmd(state, ['app', 'terminal', String(port), `--dir=${envDir}`], 'terminal=false')))
		lines.push(formatLine(t(UI.revealFinder), buildCmd(state, ['app', 'finder', String(port), `--dir=${envDir}`], 'terminal=false')))
	}
	return lines
}

/**
 * TrayBarAdapter renders SwiftBar / Argos compatible menu output with i18n support.
 */
export class TrayBarAdapter {
	static UI = {
		states: {
			starting: 'Starting...',
			reloading: 'Reloading...',
			stopping: 'Stopping...',
			'restarting-dns': 'Restarting DNS...',
		},
		proxyState: 'Proxy: {state}',
		proxyRunning: 'Proxy: Running (PID: {pids})',
		proxyStoppedError: 'Proxy: Stopped (Error)',
		proxyStopped: 'Proxy: Stopped',
		dnsActive: '🟢 DNS (dnsmasq): Active (*.test → 127.0.0.1)',
		dnsInactive: '🔴 DNS (dnsmasq): Inactive (*.test not resolving)',
		restartDns: '🔄 Restart dnsmasq',
		viewLastError: '📄 View Last Error',
		clearError: '🧹 Clear Error',
		activeDomains: 'Active Domains:',
		appActiveProxyOff: '[App Active, Proxy Off]',
		offline: '[Offline]',
		online: 'ONLINE',
		offlineLabel: 'OFFLINE',
		openTooltip: 'Click to open https://{domain}',
		portNotListening: 'Port {port} is not listening.',
		openDomain: '-- 🌐 Open https://{domain}',
		viewError: '-- ⚠️ View Error',
		siteClearError: '-- 🧹 Clear Error',
		stopServer: '-- ⏹ Stop Server (PID: {pid})',
		startDev: '-- ⚡️ Start Dev Mode',
		startProd: '-- 🚀 Start Prod Mode',
		buildAndStartBg: '-- 🔨 Build & Start (Background)',
		buildAndStartTerm: '-- 🔨 Build & Start (New Terminal)',
		viewLog: '-- 📄 View Logs',
		dockerNotRunning: '-- 🔴 OrbStack / Docker не запущений',
		startOrbStack: '-- 📡 Запустити OrbStack',
		siteErrorState: '❌ Error (див. логи)',
		viewProxyLogs: '📄 View Logs',
		dockerUp: '-- 🐳 Docker Compose Up',
		dockerDown: '-- 🐳 Docker Compose Down',
		dockerRunningLabel: '-- 🐳 Docker: Running',
		dockerStoppedLabel: '-- 🐳 Docker: Stopped',
		inProgress: '(in progress...)',
		openTerminal: '-- 💻 Open in Terminal',
		revealFinder: '-- 📂 Reveal in Finder',
		proxyControls: 'Proxy Controls',
		reloadConfig: '🔄 Sync & Reload Config',
		stopProxy: '⏹ Stop Proxy',
		startProxy: '▶ Start Proxy',
		openSitesFolder: '📂 Open Sites Folder',
		openEnvRepo: '📁 Open env repo',
	}

	/**
	 * Render full tray menu output from environment state.
	 * @param {object} [state]
	 * @param {(tpl: string, vars?: Record<string, unknown>) => string} [t]
	 * @returns {string}
	 */
	static render(state = {}, t = defaultT) {
		const envDir = state.envDir || '.'
		const caddyRunning = Boolean(state.caddyRunning)
		const sites = Array.isArray(state.sites) ? state.sites : []
		const UI = TrayBarAdapter.UI

		const lines = [...renderHeader(state, t), '---', t(UI.activeDomains)]
		for (const site of sites) {
			lines.push(...renderSite(site, state, t))
		}

		lines.push('---', t(UI.proxyControls))
		if (caddyRunning) {
			lines.push(formatLine(t(UI.reloadConfig), buildCmd(state, ['proxy', 'reload', `--dir=${envDir}`])))
			lines.push(formatLine(t(UI.stopProxy), buildCmd(state, ['proxy', 'stop', `--dir=${envDir}`])))
		} else {
			lines.push(formatLine(t(UI.startProxy), buildCmd(state, ['proxy', 'start', `--dir=${envDir}`])))
		}
		const proxyLogTarget = state.proxyLog || state.errorLog || state.logsDir
		if (proxyLogTarget) lines.push(formatLine(t(UI.viewProxyLogs), `bash=/usr/bin/open param1=${proxyLogTarget} terminal=false`))

		lines.push('---')
		if (state.sitesDir) lines.push(formatLine(t(UI.openSitesFolder), `bash=/usr/bin/open param1=${state.sitesDir} terminal=false`))
		lines.push(formatLine(t(UI.openEnvRepo), `bash=/usr/bin/open param1=${envDir} terminal=false`))

		return lines.join('\n')
	}
}
