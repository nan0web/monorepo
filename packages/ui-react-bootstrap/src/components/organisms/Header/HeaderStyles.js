export class HeaderStyles {
	// ═══════════════════════════════════════════════════════════════
	// 1. Основне тіло хедера
	// ═══════════════════════════════════════════════════════════════
	static bg = { help: 'Фон хедера', alias: 'header-bg', default: '#ffffff', defaultDark: '#212529' }
	/** @type {string} */ bg = HeaderStyles.bg.default

	static shadow = {
		control: 'shadow',
		help: 'Тінь хедера',
		alias: 'header-shadow',
		default: '0 2px 10px rgba(0, 0, 0, 0.05)',
		defaultDark: '0 2px 15px rgba(0, 0, 0, 0.5)',
	}
	/** @type {string} */ shadow = HeaderStyles.shadow.default

	static zIndex = { help: 'z-index', alias: 'header-z-index', default: 1000 }
	/** @type {number} */ zIndex = HeaderStyles.zIndex.default

	static navHeight = {
		help: 'Висота головної навігації',
		alias: 'header-nav-height',
		default: '85px',
		units: ['px', 'rem'],
		min: 40,
		max: 150,
		step: 1,
	}
	/** @type {string} */ navHeight = HeaderStyles.navHeight.default

	// ═══════════════════════════════════════════════════════════════
	// 2. Пункти головного меню (1-й рівень)
	// ═══════════════════════════════════════════════════════════════
	static navLinkTransform = {
		help: 'text-transform пунктів',
		alias: 'header-nav-link-transform',
		default: 'uppercase',
		options: ['uppercase', 'lowercase', 'capitalize', 'none'],
	}
	/** @type {string} */ navLinkTransform = HeaderStyles.navLinkTransform.default

	static navLinkWeight = {
		help: 'font-weight пунктів',
		alias: 'header-nav-link-weight',
		default: 700,
		options: ['bold', 'normal', 'lighter', '='],
		min: 100,
		max: 900,
		step: 100,
	}
	/** @type {number} */ navLinkWeight = HeaderStyles.navLinkWeight.default

	static navLinkColor = {
		help: 'Колір тексту пунктів',
		alias: 'header-nav-link-color',
		default: '#212529',
		defaultDark: '#f8f9fa',
	}
	/** @type {string} */ navLinkColor = HeaderStyles.navLinkColor.default

	static navLinkPaddingY = {
		help: 'Вертикальний padding пунктів',
		alias: 'header-nav-link-padding-y',
		default: '0.8rem',
		units: ['rem', 'px'],
		min: 0,
		max: 3,
		step: 0.1,
	}
	/** @type {string} */ navLinkPaddingY = HeaderStyles.navLinkPaddingY.default

	static navLinkPaddingX = {
		help: 'Горизонтальний padding пунктів',
		alias: 'header-nav-link-padding-x',
		default: '0.5rem',
		units: ['rem', 'px'],
		min: 0,
		max: 3,
		step: 0.1,
	}
	/** @type {string} */ navLinkPaddingX = HeaderStyles.navLinkPaddingX.default

	static navLinkSize = {
		help: 'font-size пунктів',
		alias: 'header-nav-link-size',
		default: '0.9rem',
		units: ['rem', 'px', 'em'],
		min: 0.5,
		max: 3,
		step: 0.05,
	}
	/** @type {string} */ navLinkSize = HeaderStyles.navLinkSize.default

	static navLinkSpacing = {
		help: 'letter-spacing пунктів',
		alias: 'header-nav-link-spacing',
		default: '0.5px',
		units: ['px', 'em', 'rem'],
		min: 0,
		max: 5,
		step: 0.1,
	}
	/** @type {string} */ navLinkSpacing = HeaderStyles.navLinkSpacing.default

	static activeColor = {
		help: 'Активний колір (primary)',
		alias: 'header-active-color',
		default: '#0d6efd',
		defaultDark: '#6ea8fe',
	}
	/** @type {string} */ activeColor = HeaderStyles.activeColor.default

	static caretSize = {
		help: 'Розмір каретки dropdown',
		alias: 'header-caret-size',
		default: '0.35rem',
		units: ['rem', 'px'],
		min: 0.1,
		max: 1.5,
		step: 0.05,
	}
	/** @type {string} */ caretSize = HeaderStyles.caretSize.default

	static wrapLvl1 = {
		help: 'Перенос тексту: Рівень 1 (Головне меню)',
		alias: 'header-1st-level-wrap',
		default: false,
	}
	/** @type {boolean} */ wrapLvl1 = HeaderStyles.wrapLvl1.default

	static activeLineWidth = {
		help: 'Ширина лінії активного пункту',
		alias: 'header-active-line-width',
		default: '3px',
		units: ['px', 'rem'],
		min: 0,
		max: 10,
		step: 1,
	}
	/** @type {string} */ activeLineWidth = HeaderStyles.activeLineWidth.default

	static activeArrowSize = {
		help: 'Розмір стрілки ▼ активного пункту',
		alias: 'header-active-arrow-size',
		default: '0.5rem',
		units: ['rem', 'px'],
		min: 0.1,
		max: 2,
		step: 0.05,
	}
	/** @type {string} */ activeArrowSize = HeaderStyles.activeArrowSize.default

	// ═══════════════════════════════════════════════════════════════
	// 3. Мовний перемикач (lang bubble)
	// ═══════════════════════════════════════════════════════════════
	static langSize = {
		help: 'Розмір бульбашки мови',
		alias: 'header-lang-size',
		default: '2.8rem',
		units: ['rem', 'px'],
		min: 1,
		max: 5,
		step: 0.1,
	}
	/** @type {string} */ langSize = HeaderStyles.langSize.default

	static langBg = {
		help: 'Фон бульбашки мови',
		alias: 'header-lang-bg',
		default: '#ffffff',
		defaultDark: '#212529',
	}
	/** @type {string} */ langBg = HeaderStyles.langBg.default

	static langIconSize = {
		help: 'Розмір іконки мови',
		alias: 'header-lang-icon-size',
		default: '1.4rem',
		units: ['rem', 'px'],
		min: 0.5,
		max: 3,
		step: 0.1,
	}
	/** @type {string} */ langIconSize = HeaderStyles.langIconSize.default

	static langBorder = {
		control: 'border',
		help: 'Border бульбашки',
		alias: 'header-lang-border',
		default: '1px solid #dee2e6',
		defaultDark: '1px solid rgba(255,255,255,0.15)',
	}
	/** @type {string} */ langBorder = HeaderStyles.langBorder.default

	static langShadow = {
		control: 'shadow',
		help: 'Тінь бульбашки мови',
		alias: 'header-lang-shadow',
		default: '0 2px 5px rgba(0, 0, 0, 0.05)',
		defaultDark: '0 2px 8px rgba(0, 0, 0, 0.5)',
	}
	/** @type {string} */ langShadow = HeaderStyles.langShadow.default

	// ═══════════════════════════════════════════════════════════════
	// 5. Синя смуга (subnav, 2-й рівень)
	// ═══════════════════════════════════════════════════════════════
	static subnavOffset = {
		help: 'Відступ смуги (offset)',
		alias: 'header-subnav-offset',
		default: '0px',
		units: ['px', 'rem'],
		min: -50,
		max: 100,
		step: 1,
	}
	/** @type {string} */ subnavOffset = HeaderStyles.subnavOffset.default
	static subnavHeight = {
		help: 'Висота смуги підменю',
		alias: 'header-subnav-height',
		default: '45px',
		units: ['px', 'rem'],
		min: 25,
		max: 100,
		step: 1,
	}
	/** @type {string} */ subnavHeight = HeaderStyles.subnavHeight.default

	static subnavBg = {
		help: 'Фон смуги підменю',
		alias: 'header-subnav-bg',
		default: '#0d6efd',
		defaultDark: '#052c65',
	}
	/** @type {string} */ subnavBg = HeaderStyles.subnavBg.default

	static wrapLvl2 = {
		help: 'Перенос тексту: Рівень 2 (Смуга)',
		alias: 'header-1st-level-subnav-wrap',
		default: false,
	}
	/** @type {boolean} */ wrapLvl2 = HeaderStyles.wrapLvl2.default

	static subnavLinkColor = {
		help: 'Колір тексту пунктів смуги',
		alias: 'header-subnav-link-color',
		default: '#ffffff',
		defaultDark: '#e9ecef',
	}
	/** @type {string} */ subnavLinkColor = HeaderStyles.subnavLinkColor.default

	static subnavLinkSize = {
		help: 'font-size пунктів смуги',
		alias: 'header-subnav-link-size',
		default: '0.95rem',
		units: ['rem', 'px', 'em'],
		min: 0.5,
		max: 2.5,
		step: 0.05,
	}
	/** @type {string} */ subnavLinkSize = HeaderStyles.subnavLinkSize.default

	static subnavLinkWeight = {
		help: 'font-weight пунктів смуги',
		alias: 'header-subnav-link-weight',
		default: 600,
		options: ['bold', 'normal', 'lighter', '='],
		min: 100,
		max: 900,
		step: 100,
	}
	/** @type {number} */ subnavLinkWeight = HeaderStyles.subnavLinkWeight.default

	static subnavLinkActiveColor = {
		help: 'Колір активного посилання смуги',
		alias: 'header-subnav-link-active-color',
		default: '#ffffff',
	}
	/** @type {string} */ subnavLinkActiveColor = HeaderStyles.subnavLinkActiveColor.default

	static subnavActiveBg = {
		help: 'Фон активного пункту смуги',
		alias: 'header-subnav-active-bg',
		default: 'rgba(255, 255, 255, 0.22)',
	}
	/** @type {string} */ subnavActiveBg = HeaderStyles.subnavActiveBg.default

	static subnavActiveColor = {
		help: 'Колір активного пункту смуги',
		alias: 'header-subnav-active-color',
		default: '#ffffff',
	}
	/** @type {string} */ subnavActiveColor = HeaderStyles.subnavActiveColor.default

	static subnavActiveWeight = {
		help: 'font-weight активного пункту смуги',
		alias: 'header-subnav-active-weight',
		default: 'bold',
		options: ['bold', 'normal', 'lighter', '='],
		min: 100,
		max: 900,
		step: 100,
	}
	/** @type {string} */ subnavActiveWeight = HeaderStyles.subnavActiveWeight.default

	static subnavActiveRadius = {
		help: 'border-radius активного пункту смуги',
		alias: 'header-subnav-active-radius',
		default: '0.25rem',
		units: ['rem', 'px'],
		min: 0,
		max: 2,
		step: 0.05,
	}
	/** @type {string} */ subnavActiveRadius = HeaderStyles.subnavActiveRadius.default

	// Legacy .start class (2nd level horizontal)
	static wrapLvl2Legacy = {
		help: 'Перенос тексту: Рівень 2 (Legacy .start)',
		alias: 'header-2nd-level-wrap',
		default: false,
	}
	/** @type {boolean} */ wrapLvl2Legacy = HeaderStyles.wrapLvl2Legacy.default

	// ═══════════════════════════════════════════════════════════════
	// 6. Вертикальні дропдауни (Level 3+)
	// ═══════════════════════════════════════════════════════════════
	static dropdownBg = {
		help: 'Фон вертикального dropdown',
		alias: 'header-dropdown-bg',
		default: '#0b5ed7',
		defaultDark: '#343a40',
	}
	/** @type {string} */ dropdownBg = HeaderStyles.dropdownBg.default

	static dropdownMinWidth = {
		help: 'Мінімальна ширина dropdown',
		alias: 'header-dropdown-min-width',
		default: '20rem',
		units: ['rem', 'px'],
		min: 5,
		max: 50,
		step: 1,
	}
	/** @type {string} */ dropdownMinWidth = HeaderStyles.dropdownMinWidth.default

	static dropdownShadow = {
		control: 'shadow',
		help: 'Тінь dropdown',
		alias: 'header-dropdown-shadow',
		default: '0 15px 35px rgba(0, 0, 0, 0.2)',
		defaultDark: '0 15px 35px rgba(0, 0, 0, 0.7)',
	}
	/** @type {string} */ dropdownShadow = HeaderStyles.dropdownShadow.default

	static dropdownItemPadding = {
		help: 'padding елементів dropdown',
		alias: 'header-dropdown-item-padding',
		default: '0.8rem 1.5rem',
	}
	/** @type {string} */ dropdownItemPadding = HeaderStyles.dropdownItemPadding.default

	static dropdownTextColor = {
		help: 'Колір тексту dropdown',
		alias: 'header-dropdown-text-color',
		default: '#ffffff',
	}
	/** @type {string} */ dropdownTextColor = HeaderStyles.dropdownTextColor.default

	static dropdownTextSize = {
		help: 'font-size тексту dropdown',
		alias: 'header-dropdown-text-size',
		default: '0.95rem',
		units: ['rem', 'px', 'em'],
		min: 0.5,
		max: 2.5,
		step: 0.05,
	}
	/** @type {string} */ dropdownTextSize = HeaderStyles.dropdownTextSize.default

	static wrapLvl3 = {
		help: 'Перенос тексту: Рівень 3 (Вертикальні)',
		alias: 'header-3rd-level-wrap',
		default: false,
	}
	/** @type {boolean} */ wrapLvl3 = HeaderStyles.wrapLvl3.default

	static dropdownHoverBg = {
		help: 'Фон ховеру dropdown',
		alias: 'header-dropdown-hover-bg',
		default: 'rgba(255, 255, 255, 0.1)',
	}
	/** @type {string} */ dropdownHoverBg = HeaderStyles.dropdownHoverBg.default

	static dropdownHoverColor = {
		help: 'Колір ховеру dropdown',
		alias: 'header-dropdown-hover-color',
		default: '#ffffff',
	}
	/** @type {string} */ dropdownHoverColor = HeaderStyles.dropdownHoverColor.default

	/** @param {Partial<HeaderStyles>} [input] */
	constructor(input = {}) {
		for (const key of Object.keys(input)) {
			if (key in this) {
				const meta = HeaderStyles[key]
				if (meta && typeof meta.default === 'boolean') {
					this[key] = Boolean(input[key])
				} else if (meta && typeof meta.default === 'number') {
					this[key] = Number(input[key])
				} else {
					this[key] = String(input[key])
				}
			}
		}
	}
}
