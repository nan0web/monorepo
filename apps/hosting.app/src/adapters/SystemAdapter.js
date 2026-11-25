import { execFile, spawn } from 'node:child_process'
import { access } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

/**
 * Build process environment with optional extra PATH entries.
 * @param {Record<string, string>} [extra]
 * @returns {NodeJS.ProcessEnv}
 */
function buildEnv(extra = {}) {
	const nodeBin = dirname(process.execPath)
	const home = extra.HOME || process.env.HOME || homedir()
	const basePath = extra.PATH || process.env.PATH || '/usr/bin:/bin:/usr/sbin:/sbin'
	const candidates = [
		nodeBin,
		home ? join(home, 'Library/pnpm') : '',
		home ? join(home, 'homebrew/bin') : '',
		home ? join(home, '.orbstack/bin') : '',
		'/opt/homebrew/bin',
		'/usr/local/bin',
	]
	const existing = basePath.split(':')
	const prefix = candidates.filter((p) => p && !existing.includes(p))
	return {
		...process.env,
		...extra,
		PATH: [...new Set([...prefix, ...existing])].join(':'),
	}
}

/**
 * Cross-platform SystemAdapter for process, port, DNS, Docker and desktop actions.
 */
export class SystemAdapter {
	/**
	 * @param {object} [options]
	 * @param {string} [options.platform]
	 */
	constructor(options = {}) {
		this.platform = options.platform || process.platform
	}

	/**
	 * Execute a command and return stdout/stderr safely.
	 * @param {string} cmd
	 * @param {string[]} [args]
	 * @param {object} [opts]
	 * @returns {Promise<{ ok: boolean, stdout: string, stderr: string }>}
	 */
	async exec(cmd, args = [], opts = {}) {
		try {
			const { stdout, stderr } = await execFileAsync(cmd, args, {
				env: buildEnv(opts.env),
				cwd: opts.cwd,
				timeout: opts.timeout || 30000,
			})
			return { ok: true, stdout: stdout.trim(), stderr: stderr.trim() }
		} catch (err) {
			return {
				ok: false,
				stdout: err.stdout ? String(err.stdout).trim() : '',
				stderr: err.stderr ? String(err.stderr).trim() : err.message,
			}
		}
	}

	/**
	 * Check if a process ID is alive.
	 * @param {number|string} pid
	 * @returns {boolean}
	 */
	isPidAlive(pid) {
		const num = Number(pid)
		if (!Number.isInteger(num) || num <= 0) return false
		try {
			process.kill(num, 0)
			return true
		} catch {
			return false
		}
	}

	/**
	 * Get running Caddy PIDs.
	 * @returns {Promise<string[]>}
	 */
	async getCaddyPids() {
		const res = await this.exec('pgrep', ['-x', 'caddy'])
		if (!res.ok || !res.stdout) return []
		return res.stdout.split(/\s+/).filter(Boolean)
	}

	/**
	 * Check if local *.test DNS resolution works.
	 * @returns {Promise<boolean>}
	 */
	async isDnsOk() {
		if (this.platform === 'darwin') {
			const res = await this.exec('dscacheutil', ['-q', 'host', '-a', 'name', 'dnsmasq-healthcheck.test'])
			return res.ok && res.stdout.includes('127.0.0.1')
		}
		const res = await this.exec('getent', ['hosts', 'dnsmasq-healthcheck.test'])
		return res.ok && res.stdout.includes('127.0.0.1')
	}

	/**
	 * Get PIDs listening on a TCP port.
	 * @param {number|string} port
	 * @returns {Promise<string[]>}
	 */
	async getPortPids(port) {
		const res = await this.exec('lsof', ['-ti', `:${port}`])
		if (res.ok && res.stdout) return res.stdout.split(/\s+/).filter(Boolean)
		if (this.platform === 'linux') {
			const fuser = await this.exec('fuser', [`${port}/tcp`])
			if (fuser.ok && fuser.stdout) return fuser.stdout.split(/\s+/).filter(Boolean)
		}
		return []
	}

	/**
	 * Stop all processes listening on a given port.
	 * @param {number|string} port
	 * @returns {Promise<string[]>}
	 */
	async stopPort(port) {
		const pids = await this.getPortPids(port)
		for (const pid of pids) {
			try {
				process.kill(Number(pid), 'SIGKILL')
			} catch {
				// Process already exited
			}
		}
		return pids
	}

	/**
	 * Wait until a port starts listening.
	 * @param {number|string} port
	 * @param {number} [maxChecks]
	 * @returns {Promise<boolean>}
	 */
	async waitForPort(port, maxChecks = 12) {
		for (let i = 0; i < maxChecks; i++) {
			const pids = await this.getPortPids(port)
			if (pids.length > 0) return true
			await new Promise((r) => setTimeout(r, 500))
		}
		return false
	}

	/**
	 * Check if Docker / OrbStack daemon is reachable with a short timeout.
	 * @returns {Promise<boolean>}
	 */
	async isDockerRunning() {
		const res = await this.exec('docker', ['info'], { timeout: 2500 })
		return res.ok
	}

	/**
	 * Resolve absolute paths to current nan0host script/binary and Node.js executable.
	 * @returns {{ binPath: string, nodePath: string }}
	 */
	resolveCliPaths() {
		return {
			binPath: process.argv[1] || 'nan0host',
			nodePath: process.execPath || 'node',
		}
	}

	/**
	 * Ensure Docker daemon and compose services are running.
	 * @param {string} composeDir
	 * @param {string[]} [services]
	 * @returns {Promise<{ ok: boolean, error?: string }>}
	 */
	async ensureDocker(composeDir, services = []) {
		let info = await this.exec('docker', ['info'])
		if (!info.ok && this.platform === 'darwin') {
			this.notify('OrbStack', 'OrbStack не активний. Запускаю...')
			await this.exec('open', ['-a', 'OrbStack'])
			for (let i = 0; i < 12; i++) {
				await new Promise((r) => setTimeout(r, 1000))
				info = await this.exec('docker', ['info'])
				if (info.ok) break
			}
		}
		if (!info.ok) return { ok: false, error: 'Docker daemon is not running' }

		const args = ['compose', 'up', '-d', ...services]
		const up = await this.exec('docker', args, { cwd: composeDir, timeout: 60000 })
		if (!up.ok) return { ok: false, error: up.stderr || up.stdout }

		if (services.includes('postgres')) {
			for (let i = 0; i < 10; i++) {
				const pg = await this.exec('docker', ['compose', 'exec', '-T', 'postgres', 'pg_isready'], { cwd: composeDir })
				if (pg.ok) break
				await new Promise((r) => setTimeout(r, 500))
			}
		}
		return { ok: true }
	}

	/**
	 * Check if Docker Compose services are currently running in the given directory.
	 * @param {string} dockerDir
	 * @param {string[]} [services]
	 * @returns {Promise<boolean>}
	 */
	async isDockerComposeRunning(dockerDir, services = []) {
		if (!dockerDir) return false
		const args = ['compose', 'ps', '--status', 'running', '--services', ...services]
		const res = await this.exec('docker', args, { cwd: dockerDir, timeout: 5000 })
		return res.ok && res.stdout.trim().length > 0
	}

	/**
	 * Stop Docker Compose services in the given directory.
	 * @param {string} dockerDir
	 * @param {string[]} [services]
	 * @returns {Promise<{ ok: boolean, error?: string }>}
	 */
	async stopDocker(dockerDir, services = []) {
		if (!dockerDir) return { ok: true }
		const args = services.length > 0 ? ['compose', 'stop', ...services] : ['compose', 'down']
		const res = await this.exec('docker', args, { cwd: dockerDir, timeout: 60000 })
		return res.ok ? { ok: true } : { ok: false, error: res.stderr || res.stdout }
	}

	/**
	 * Check if a file exists on the host filesystem (supports paths outside $db root).
	 * @param {string} filePath
	 * @returns {Promise<boolean>}
	 */
	async fileExists(filePath) {
		if (!filePath) return false
		try {
			await access(filePath)
			return true
		} catch {
			return false
		}
	}

	/**
	 * Spawn a detached background process redirecting output to a log file.
	 * @param {string} cmd
	 * @param {string[]} args
	 * @param {object} opts
	 * @returns {Promise<number | undefined>}
	 */
	async spawnDetached(cmd, args, opts = {}) {
		const { mkdirSync, openSync } = await import('node:fs')
		if (opts.logFile) mkdirSync(dirname(opts.logFile), { recursive: true })
		const out = opts.logFile ? openSync(opts.logFile, 'a') : 'ignore'
		const child = spawn(cmd, args, {
			cwd: opts.cwd,
			env: buildEnv(opts.env),
			detached: true,
			stdio: ['ignore', out, out],
		})
		child.unref()
		return child.pid
	}

	/**
	 * Restart local DNS service (dnsmasq on macOS/Linux).
	 * @returns {Promise<{ ok: boolean, error?: string }>}
	 */
	async restartDns() {
		if (this.platform === 'darwin') {
			const script = 'do shell script "brew services restart dnsmasq && dscacheutil -flushcache && killall -HUP mDNSResponder || true" with administrator privileges'
			const res = await this.exec('osascript', ['-e', script])
			return res.ok ? { ok: true } : { ok: false, error: res.stderr }
		}
		const res = await this.exec('sudo', ['systemctl', 'restart', 'dnsmasq'])
		return res.ok ? { ok: true } : { ok: false, error: res.stderr }
	}

	/**
	 * Send desktop notification.
	 * @param {string} title
	 * @param {string} message
	 */
	notify(title, message) {
		if (this.platform === 'darwin') {
			const safeMsg = message.replace(/"/g, '\\"')
			const safeTitle = title.replace(/"/g, '\\"')
			this.exec('osascript', ['-e', `display notification "${safeMsg}" with title "${safeTitle}"`]).catch(() => {})
		} else if (this.platform === 'linux') {
			this.exec('notify-send', [title, message]).catch(() => {})
		}
	}

	/**
	 * Refresh SwiftBar dev-proxy plugin if on macOS.
	 */
	refreshTray() {
		if (this.platform === 'darwin') {
			this.exec('open', ['-g', 'swiftbar://refreshplugin?name=dev-proxy']).catch(() => {})
		}
	}

	/**
	 * Open terminal at target directory with optional command.
	 * @param {string} dir
	 * @param {string} [cmd]
	 */
	async openTerminal(dir, cmd = '') {
		if (this.platform === 'darwin') {
			const script = cmd
				? `tell application "Terminal" to do script "cd '${dir}' && ${cmd}"`
				: `tell application "Terminal" to do script "cd '${dir}'"`
			await this.exec('osascript', ['-e', script])
		} else if (this.platform === 'linux') {
			const args = cmd ? [`--working-directory=${dir}`, '--', 'bash', '-c', `${cmd}; exec bash`] : [`--working-directory=${dir}`]
			await this.spawnDetached('gnome-terminal', args)
		}
	}

	/**
	 * Open directory in OS file manager.
	 * @param {string} dir
	 */
	async openFileManager(dir) {
		const opener = this.platform === 'darwin' ? 'open' : 'xdg-open'
		await this.exec(opener, [dir])
	}
}

export default SystemAdapter
