import fs from 'node:fs/promises'
import process from 'node:process'
import { randomUUID } from 'node:crypto'
import path from 'node:path'

/** @typedef {{ role: string, content: string }} ChatMessage */

export class ChatConfig {
	model = ''
	provider = ''
	constructor(input = {}) {
		const { model = this.model, provider = this.provider } = input
		this.model = String(model)
		this.provider = String(provider)
	}
}

/**
 * Manages chat history and artifacts in the file system.
 */
export class ChatSession {
	/** @type {string} Session ID */ id
	/** @type {string} Working directory */ cwd
	/** @type {ChatMessage[]} Message history */
	messages = []
	/** @type {string} Absolute path to session directory */
	#dir
	/** @type {{ files: string[], task: string, meta: Record<string, any> }} */
	context = { files: [], task: '', meta: {} }
	/** @type {string[]} Error collection from quality gates */
	errors = []
	/** @type {number} Number of self-healing retries performed */
	retries = 0
	/** @type {number} Maximum allowed retries before requiring user approval */
	maxRetries = 3

	/**
	 * @param {Object} [input={}]
	 * @param {string} [input.id]
	 * @param {string} [input.cwd]
	 * @param {string} [input.root='chat']
	 * @param {ChatMessage[]} [input.messages=[]]
	 * @param {{ files?: string[], task?: string, meta?: Record<string, any> }} [input.context]
	 * @param {number} [input.maxRetries=3]
	 */
	constructor(input = {}) {
		const {
			id = randomUUID(),
			cwd = process.cwd(),
			root = 'chat',
			messages = [],
			context = {},
			maxRetries = 3,
		} = input
		this.id = String(id)
		this.cwd = String(cwd)
		this.root = String(root)
		this.messages = messages
		this.context = {
			files: Array.isArray(context.files) ? [...context.files] : [],
			task: context.task ? String(context.task) : '',
			meta: context.meta && typeof context.meta === 'object' ? { ...context.meta } : {},
		}
		this.maxRetries = Number(maxRetries) || 3
		this.#dir = path.resolve(this.cwd, this.root, this.id)
	}

	/**
	 * Registers a file into the active chat context if not already present.
	 * Updates the modification timestamp in context metadata.
	 * @param {string} file
	 */
	addFile(file) {
		if (!file) return
		const filePath = String(file)
		if (!this.context.files.includes(filePath)) {
			this.context.files.push(filePath)
		}
		if (!this.context.meta.fileUpdates) {
			this.context.meta.fileUpdates = {}
		}
		this.context.meta.fileUpdates[filePath] = Date.now()
	}

	/**
	 * Removes a file from active context.
	 * @param {string} file
	 */
	removeFile(file) {
		const filePath = String(file)
		this.context.files = this.context.files.filter((f) => f !== filePath)
		if (this.context.meta.fileUpdates) {
			delete this.context.meta.fileUpdates[filePath]
		}
	}

	/**
	 * Checks if a file exists in the active context.
	 * @param {string} file
	 * @returns {boolean}
	 */
	hasFile(file) {
		return this.context.files.includes(String(file))
	}

	/**
	 * Marks that a file has been modified or touched with current timestamp.
	 * @param {string} file
	 */
	touchFile(file) {
		this.addFile(file)
	}

	/**
	 * Adds error or list of errors into session.
	 * @param {string|string[]} errorOrErrors
	 */
	addError(errorOrErrors) {
		if (Array.isArray(errorOrErrors)) {
			this.errors.push(...errorOrErrors.map(String))
		} else if (errorOrErrors) {
			this.errors.push(String(errorOrErrors))
		}
	}

	/**
	 * Check if any errors occurred during verification.
	 * @returns {boolean}
	 */
	hasErrors() {
		return this.errors.length > 0
	}

	/**
	 * Reset errors for a new validation cycle.
	 */
	resetErrors() {
		this.errors = []
	}

	/**
	 * Check if automatic retry is permitted.
	 * @returns {boolean}
	 */
	canContinue() {
		return this.retries < this.maxRetries
	}

	/**
	 * Increment retry counter.
	 */
	nextRetry() {
		this.retries++
	}

	get dir() {
		return this.#dir
	}

	/**
	 * Initialize session directory.
	 */
	async init() {
		await fs.mkdir(this.dir, { recursive: true })
	}

	/**
	 * Add a message to the history.
	 * @param {ChatMessage} message
	 */
	add(message) {
		this.messages.push(message)
	}

	/**
	 * Save the current state of messages to messages.jsonl.
	 */
	async save() {
		const filePath = path.join(this.dir, 'messages.jsonl')
		const content = this.messages.map((m) => JSON.stringify(m)).join('\n') + '\n'
		await fs.writeFile(filePath, content, 'utf-8')
	}

	/**
	 * Load messages from the file system.
	 */
	async load() {
		const filePath = path.join(this.dir, 'messages.jsonl')
		try {
			const content = await fs.readFile(filePath, 'utf-8')
			this.messages = content
				.split('\n')
				.filter(Boolean)
				.map((line) => JSON.parse(line))
			return true
		} catch {
			return false
		}
	}

	/**
	 * Save a specific artifact (like answer.md or prompt.md).
	 * @param {string} filename
	 * @param {string} content
	 */
	async saveArtifact(filename, content) {
		const filePath = path.join(this.dir, filename)
		await fs.mkdir(path.dirname(filePath), { recursive: true })
		await fs.writeFile(filePath, content, 'utf-8')
	}

	/**
	 * Append content to a file (useful for streaming logs).
	 * @param {string} filename
	 * @param {string} content
	 */
	async appendArtifact(filename, content) {
		const filePath = path.join(this.dir, filename)
		await fs.mkdir(path.dirname(filePath), { recursive: true })
		await fs.appendFile(filePath, content, 'utf-8')
	}
}
