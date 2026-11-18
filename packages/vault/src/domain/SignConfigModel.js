import { Model } from '@nan0web/types'

/**
 * ImageFile - Visual asset file descriptor (e.g. stamp, signature).
 */
export class ImageFile extends Model {
	static src = {
		help: 'Path to image file (SVG/PNG)',
		default: '',
	}
	static width = {
		help: 'Image width (e.g. 200px)',
		default: '200px',
	}
	static height = {
		help: 'Image height (e.g. 200px)',
		default: '200px',
	}

	/**
	 * @param {Partial<ImageFile>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Path to image file (SVG/PNG) */ this.src
		/** @type {string} Image width (e.g. 200px) */ this.width
		/** @type {string} Image height (e.g. 200px) */ this.height
	}
}

/**
 * Assets - Visual assets configuration for signing.
 */
export class Assets extends Model {
	static stamp = {
		help: 'Stamp and signature image configuration',
		type: ImageFile,
		default: new ImageFile(),
	}

	/**
	 * @param {Partial<Assets>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {ImageFile} */ this.stamp
	}
}

/**
 * PgpConfig - PGP signing configuration.
 */
export class PgpConfig extends Model {
	static key_id = {
		help: 'GPG key ID for detached signature',
		default: '',
	}
	static armor = {
		help: 'Output ASCII-armored .asc signature instead of binary .sig',
		default: true,
	}

	/**
	 * @param {Partial<PgpConfig>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.key_id
		/** @type {boolean} */ this.armor
	}
}

/**
 * QesConfig - QES (qualified electronic signature / КЕП) configuration.
 */
export class QesConfig extends Model {
	static enabled = {
		help: 'Enable QES signing (.p7s)',
		default: false,
	}
	static provider = {
		help: 'QES provider (cli, eu-sign, diia)',
		default: 'cli',
	}
	static command = {
		help: 'CLI command template for QES signing (e.g. eu-sign -sign {input} {output})',
		default: '',
	}
	static format = {
		help: 'Output signature file extension (default: p7s)',
		default: 'p7s',
	}

	/**
	 * @param {Partial<QesConfig>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {boolean} Enable QES signing (.p7s) */ this.enabled
		/** @type {string} QES provider (cli, eu-sign, diia) */ this.provider
		/** @type {string} CLI command template for QES signing */ this.command
		/** @type {string} Output signature file extension */ this.format
	}
}

/**
 * QrConfig - QR validation URL configuration.
 */
export class QrConfig extends Model {
	static base_url = {
		help: 'Base URL for QR validation (e.g. IPFS gateway)',
		default: '',
	}

	/**
	 * @param {Partial<QrConfig>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.base_url
	}
}

/**
 * SignConfigModel - Schema for `_.nan0` sign section with cascading inheritance.
 */
export class SignConfigModel extends Model {
	static alias = 'sign'

	static assets = {
		help: 'Visual assets configuration (stamp, signature)',
		type: Assets,
		default: new Assets(),
	}

	static pgp = {
		help: 'PGP signing configuration',
		type: PgpConfig,
		default: new PgpConfig(),
	}

	static qes = {
		help: 'QES (qualified electronic signature) configuration',
		type: QesConfig,
		default: new QesConfig(),
	}

	static qr = {
		help: 'QR validation URL configuration',
		type: QrConfig,
		default: new QrConfig(),
	}

	static output = {
		help: 'Output directory for .pdf, .pdf.sig, .sha256',
		default: '',
	}

	/**
	 * @param {Partial<SignConfigModel>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {Assets} Visual assets configuration */ this.assets
		/** @type {PgpConfig} PGP signing configuration */ this.pgp
		/** @type {QesConfig} QES signing configuration */ this.qes
		/** @type {QrConfig} QR validation configuration */ this.qr
		/** @type {string} */ this.output
	}
}
