import { ModelAsApp, progress, show } from '@nan0web/ui'
import { SignConfigModel } from './SignConfigModel.js'

/**
 * SignApp - Sovereign document signing pipeline (`nan0vault sign <file.md>`).
 * Converts Markdown -> PDF (with stamp & QR) -> SHA-256 -> GPG detached signature.
 */
export class SignApp extends ModelAsApp {
	static alias = 'sign'

	static UI = {
		errorNoFile: 'Source markdown file path is required',
		errorNoPdfDriver: 'PDF driver is required to render PDF output',
		stepResolving: 'Resolving configuration and loading document...',
		stepRenderingPdf: 'Rendering PDF...',
		stepSigningPgp: 'Signing PDF with PGP key {keyId}...',
		stepPgpSkipped: 'PGP signing skipped (no pgp.key_id configured)',
		stepSigningQes: 'Signing PDF with QES ({provider})...',
		stepQesSkipped: 'QES signing skipped (disabled or no driver)',
		warnAssetNotFound: 'Referenced asset not found: {path}',
	}

	static file = {
		help: 'Path to the source markdown file (.md)',
		default: '',
	}

	/**
	 * @param {Partial<SignApp>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions> & {
	 *   pdf?: { render: (content: string, outPath: string, config: SignConfigModel) => Promise<Buffer|Uint8Array> },
	 *   pgp?: { sign: (pdfBuffer: Buffer|Uint8Array, keyId: string, armor?: boolean) => Promise<string|Buffer> },
	 *   qes?: { sign: (pdfBuffer: Buffer|Uint8Array, qesConfig: import('./SignConfigModel.js').QesConfig) => Promise<Buffer|Uint8Array> },
	 *   sha256?: (buffer: Buffer|Uint8Array) => Promise<string> | string,
	 * }} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Path to the source markdown file (.md) */ this.file
		this.$pdf = options.pdf
		this.$pgp = options.pgp
		this.$qes = options.qes
		this.$sha256 = options.sha256
	}

	/**
	 * Executes the full signing pipeline.
	 * @returns {AsyncGenerator<any, {
	 *   config: SignConfigModel,
	 *   pdfPath: string,
	 *   sigPath: string | null,
	 *   qesPath: string | null,
	 *   sha256Path: string,
	 *   sha256: string,
	 * }, unknown>}
	 */
	async *run() {
		const { t } = this._
		if (!this.file) throw new Error(t(SignApp.UI.errorNoFile))
		if (!this.$pdf) throw new Error(t(SignApp.UI.errorNoPdfDriver))

		const resolvingMsg = t(SignApp.UI.stepResolving)
		yield progress(resolvingMsg)
		const baseDir = this.$db.dirname(this.file)
		const baseName = this.$db.basename(this.file, '.md')
		const indexUri = baseDir ? `${baseDir}/index` : 'index'
		const indexStat = await this.$db.statDocument(indexUri).catch(() => null)
		const createdIndex = !indexStat || !indexStat.exists
		if (createdIndex) {
			await this.$db.saveDocument(indexUri, {})
		}
		let globals = {}
		try {
			globals = (await this.$db.fetch(indexUri)) || {}
		} finally {
			if (createdIndex) {
				await this.$db.dropDocument(indexUri).catch(() => {})
			}
		}
		const config = new SignConfigModel(globals?.sign || {})
		const loaded = await this.$db.loadDocument(this.file)
		const rawMd = typeof loaded === 'string' ? loaded : String(loaded?.content ?? loaded)
		const outDir = config.output || baseDir

		let content = rawMd

		const stampSrc = config.assets?.stamp?.src
		if (stampSrc) {
			const resolvedStamp = baseDir ? `${baseDir}/${stampSrc}` : stampSrc
			const stampSvg = String(await this.$db.loadDocument(resolvedStamp))
			const width = config.assets?.stamp?.width || '200px'
			const height = config.assets?.stamp?.height || '200px'
			const stampBlock = `<div class="nan0-stamp" style="width:${width};height:${height}">${stampSvg}</div>`
			content = content.includes('<!-- STAMP -->')
				? content.replace('<!-- STAMP -->', stampBlock)
				: `${content}\n\n${stampBlock}`
		}

		const qrBase = config.qr?.base_url
		if (qrBase) {
			const qrBlock = `<div class="nan0-qr" data-url="${qrBase}">${qrBase}</div>`
			content = content.includes('<!-- QR -->')
				? content.replace('<!-- QR -->', qrBlock)
				: `${content}\n\n${qrBlock}`
		}

		const assetRefs = [...content.matchAll(/(?:!\[[^\]]*\]\(|<img[^>]+src=["'])([^)"'\s>]+)/g)].map(
			(m) => m[1]
		)
		for (const ref of assetRefs) {
			if (/^https?:\/\/|^data:/i.test(ref)) continue
			const resolved = baseDir ? `${baseDir}/${ref}` : ref
			const stat = await this.$db.statDocument(resolved).catch(() => null)
			if (!stat || !stat.exists) {
				yield show(t(SignApp.UI.warnAssetNotFound, { path: resolved }), 'warn')
			}
		}

		yield progress(resolvingMsg, undefined, { stop: 'success' })

		const pdfMsg = t(SignApp.UI.stepRenderingPdf)
		yield progress(pdfMsg)
		const pdfPath = outDir ? `${outDir}/${baseName}.pdf` : `${baseName}.pdf`
		const pdfBuffer = Buffer.from(await this.$pdf.render(content, pdfPath, config))
		await this.$db.saveDocument(pdfPath, pdfBuffer)
		yield progress(pdfMsg, undefined, { stop: 'success' })
		yield show(`PDF: ${pdfPath}`, 'info', { path: pdfPath })

		const sha256 = this.$sha256 ? await this.$sha256(pdfBuffer) : ''

		let sigPath = null
		if (config.pgp?.key_id && this.$pgp) {
			yield show(t(SignApp.UI.stepSigningPgp, { keyId: config.pgp.key_id }))
			const armor = config.pgp.armor !== false
			const sig = await this.$pgp.sign(pdfBuffer, config.pgp.key_id, armor)
			const ext = armor ? '.pdf.asc' : '.pdf.sig'
			sigPath = outDir ? `${outDir}/${baseName}${ext}` : `${baseName}${ext}`
			await this.$db.saveDocument(sigPath, sig)
			yield show(`PGP: ${sigPath}`, 'info', { path: sigPath })
		} else {
			yield show(t(SignApp.UI.stepPgpSkipped))
		}

		let qesPath = null
		if (config.qes?.enabled && this.$qes) {
			const qesMsg = t(SignApp.UI.stepSigningQes, { provider: config.qes.provider || 'cli' })
			yield progress(qesMsg)
			const qesSig = await this.$qes.sign(pdfBuffer, config.qes)
			const qesExt = `.pdf.${config.qes.format || 'p7s'}`
			qesPath = outDir ? `${outDir}/${baseName}${qesExt}` : `${baseName}${qesExt}`
			await this.$db.saveDocument(qesPath, qesSig)
			yield progress(qesMsg, undefined, { stop: 'success' })
			yield show(qesPath, 'info', { path: qesPath })
		} else {
			yield show(t(SignApp.UI.stepQesSkipped))
		}

		return { config, pdfPath, sigPath, qesPath, sha256 }
	}
}
