import { typeOf, notEmpty } from '@nan0web/types'

/**
 * Handles locale-specific formatting for different data types.
 */
export default class Locale {
	/** @type {string} Language locale */
	lang

	/** @type {string} Collation locale */
	collate

	/** @type {string} Character type locale */
	ctype

	/** @type {string} Messages locale */
	messages

	/** @type {string} Monetary locale */
	monetary

	/** @type {string} Numeric locale */
	numeric

	/** @type {string} Time locale */
	time

	/** @type {string} General locale fallback */
	all

	/**
	 * Creates a new Locale instance.
	 * @param {object} props - Locale properties or all locale string
	 * @param {string} [props.lang=""] - Language locale
	 * @param {string} [props.collate=""] - Collation locale
	 * @param {string} [props.ctype=""] - Character type locale
	 * @param {string} [props.messages=""] - Messages locale
	 * @param {string} [props.monetary=""] - Monetary locale
	 * @param {string} [props.numeric=""] - Numeric locale
	 * @param {string} [props.time=""] - Time locale
	 * @param {string} [props.all="uk_UA.UTF-8"] - General locale fallback
	 */
	constructor(props = {}) {
		const {
			lang = '',
			collate = '',
			ctype = '',
			messages = '',
			monetary = '',
			numeric = '',
			time = '',
			all = 'uk_UA.UTF-8',
		} = props
		this.lang = lang
		this.collate = collate
		this.ctype = ctype
		this.messages = messages
		this.monetary = monetary
		this.numeric = numeric
		this.time = time
		this.all = all
	}

	/**
	 * Formats values according to locale settings.
	 * @param {Function} type - Type constructor (Number, String, etc.)
	 * @param {object} options - Formatting options
	 * @returns {Function|null} Formatting function or null if unsupported type
	 */
	format(type, options) {
		if (Number === type || typeOf(Number)(type)) {
			/**
			 * new (locales?: LocalesArgument, options?: NumberFormatOptions): NumberFormat;
			 * (locales?: LocalesArgument, options?: NumberFormatOptions): NumberFormat;
			 * supportedLocalesOf(locales: LocalesArgument, options?: NumberFormatOptions): string[];
			 */
			/**
			 * localeMatcher?: "lookup" | "best fit" | undefined;
			 * style?: NumberFormatOptionsStyle | undefined;
			 * currency?: string | undefined;
			 * currencyDisplay?: NumberFormatOptionsCurrencyDisplay | undefined;
			 * useGrouping?: NumberFormatOptionsUseGrouping | undefined;
			 * minimumIntegerDigits?: number | undefined;
			 * minimumFractionDigits?: number | undefined;
			 * maximumFractionDigits?: number | undefined;
			 * minimumSignificantDigits?: number | undefined;
			 * maximumSignificantDigits?: number | undefined;
			 */
			const locales = [this.numeric, this.all, this.lang].filter(notEmpty)
			return (value) => {
				return new Intl.NumberFormat(locales, options).format(value)
			}
		}
		if ('string' === typeof type) {
			const locales = [this.monetary, this.numeric, this.all, this.lang].filter(notEmpty)
			return (value) => {
				return new Intl.NumberFormat(locales, {
					style: 'currency',
					currency: type === 'currency' ? options.currency : type,
					...options,
				}).format(value)
			}
		}
		return null
	}

	/**
	 * @param {any} input
	 * @returns {Locale}
	 */
	static from(input) {
		if (input instanceof Locale) return input
		if ('string' === typeof input) {
			return new Locale({ all: input })
		}
		return new Locale(input)
	}
}
