export class HeaderStyles {
    static bg: {
        help: string;
        alias: string;
        default: string;
        defaultDark: string;
    };
    static shadow: {
        control: string;
        help: string;
        alias: string;
        default: string;
        defaultDark: string;
    };
    static zIndex: {
        help: string;
        alias: string;
        default: number;
    };
    static navHeight: {
        help: string;
        alias: string;
        default: string;
        units: string[];
        min: number;
        max: number;
        step: number;
    };
    static navLinkTransform: {
        help: string;
        alias: string;
        default: string;
        options: string[];
    };
    static navLinkWeight: {
        help: string;
        alias: string;
        default: number;
        options: string[];
        min: number;
        max: number;
        step: number;
    };
    static navLinkColor: {
        help: string;
        alias: string;
        default: string;
        defaultDark: string;
    };
    static navLinkPaddingY: {
        help: string;
        alias: string;
        default: string;
        units: string[];
        min: number;
        max: number;
        step: number;
    };
    static navLinkPaddingX: {
        help: string;
        alias: string;
        default: string;
        units: string[];
        min: number;
        max: number;
        step: number;
    };
    static navLinkSize: {
        help: string;
        alias: string;
        default: string;
        units: string[];
        min: number;
        max: number;
        step: number;
    };
    static navLinkSpacing: {
        help: string;
        alias: string;
        default: string;
        units: string[];
        min: number;
        max: number;
        step: number;
    };
    static activeColor: {
        help: string;
        alias: string;
        default: string;
        defaultDark: string;
    };
    static caretSize: {
        help: string;
        alias: string;
        default: string;
        units: string[];
        min: number;
        max: number;
        step: number;
    };
    static wrapLvl1: {
        help: string;
        alias: string;
        default: boolean;
    };
    static activeLineWidth: {
        help: string;
        alias: string;
        default: string;
        units: string[];
        min: number;
        max: number;
        step: number;
    };
    static activeArrowSize: {
        help: string;
        alias: string;
        default: string;
        units: string[];
        min: number;
        max: number;
        step: number;
    };
    static langSize: {
        help: string;
        alias: string;
        default: string;
        units: string[];
        min: number;
        max: number;
        step: number;
    };
    static langBg: {
        help: string;
        alias: string;
        default: string;
        defaultDark: string;
    };
    static langIconSize: {
        help: string;
        alias: string;
        default: string;
        units: string[];
        min: number;
        max: number;
        step: number;
    };
    static langBorder: {
        control: string;
        help: string;
        alias: string;
        default: string;
        defaultDark: string;
    };
    static langShadow: {
        control: string;
        help: string;
        alias: string;
        default: string;
        defaultDark: string;
    };
    static subnavOffset: {
        help: string;
        alias: string;
        default: string;
        units: string[];
        min: number;
        max: number;
        step: number;
    };
    static subnavHeight: {
        help: string;
        alias: string;
        default: string;
        units: string[];
        min: number;
        max: number;
        step: number;
    };
    static subnavBg: {
        help: string;
        alias: string;
        default: string;
        defaultDark: string;
    };
    static wrapLvl2: {
        help: string;
        alias: string;
        default: boolean;
    };
    static subnavLinkColor: {
        help: string;
        alias: string;
        default: string;
        defaultDark: string;
    };
    static subnavLinkSize: {
        help: string;
        alias: string;
        default: string;
        units: string[];
        min: number;
        max: number;
        step: number;
    };
    static subnavLinkWeight: {
        help: string;
        alias: string;
        default: number;
        options: string[];
        min: number;
        max: number;
        step: number;
    };
    static subnavLinkActiveColor: {
        help: string;
        alias: string;
        default: string;
    };
    static subnavActiveBg: {
        help: string;
        alias: string;
        default: string;
    };
    static subnavActiveColor: {
        help: string;
        alias: string;
        default: string;
    };
    static subnavActiveWeight: {
        help: string;
        alias: string;
        default: string;
        options: string[];
        min: number;
        max: number;
        step: number;
    };
    static subnavActiveRadius: {
        help: string;
        alias: string;
        default: string;
        units: string[];
        min: number;
        max: number;
        step: number;
    };
    static wrapLvl2Legacy: {
        help: string;
        alias: string;
        default: boolean;
    };
    static dropdownBg: {
        help: string;
        alias: string;
        default: string;
        defaultDark: string;
    };
    static dropdownMinWidth: {
        help: string;
        alias: string;
        default: string;
        units: string[];
        min: number;
        max: number;
        step: number;
    };
    static dropdownShadow: {
        control: string;
        help: string;
        alias: string;
        default: string;
        defaultDark: string;
    };
    static dropdownItemPadding: {
        help: string;
        alias: string;
        default: string;
    };
    static dropdownTextColor: {
        help: string;
        alias: string;
        default: string;
    };
    static dropdownTextSize: {
        help: string;
        alias: string;
        default: string;
        units: string[];
        min: number;
        max: number;
        step: number;
    };
    static wrapLvl3: {
        help: string;
        alias: string;
        default: boolean;
    };
    static dropdownHoverBg: {
        help: string;
        alias: string;
        default: string;
    };
    static dropdownHoverColor: {
        help: string;
        alias: string;
        default: string;
    };
    /** @param {Partial<HeaderStyles>} [input] */
    constructor(input?: Partial<HeaderStyles>);
    /** @type {string} */ bg: string;
    /** @type {string} */ shadow: string;
    /** @type {number} */ zIndex: number;
    /** @type {string} */ navHeight: string;
    /** @type {string} */ navLinkTransform: string;
    /** @type {number} */ navLinkWeight: number;
    /** @type {string} */ navLinkColor: string;
    /** @type {string} */ navLinkPaddingY: string;
    /** @type {string} */ navLinkPaddingX: string;
    /** @type {string} */ navLinkSize: string;
    /** @type {string} */ navLinkSpacing: string;
    /** @type {string} */ activeColor: string;
    /** @type {string} */ caretSize: string;
    /** @type {boolean} */ wrapLvl1: boolean;
    /** @type {string} */ activeLineWidth: string;
    /** @type {string} */ activeArrowSize: string;
    /** @type {string} */ langSize: string;
    /** @type {string} */ langBg: string;
    /** @type {string} */ langIconSize: string;
    /** @type {string} */ langBorder: string;
    /** @type {string} */ langShadow: string;
    /** @type {string} */ subnavOffset: string;
    /** @type {string} */ subnavHeight: string;
    /** @type {string} */ subnavBg: string;
    /** @type {boolean} */ wrapLvl2: boolean;
    /** @type {string} */ subnavLinkColor: string;
    /** @type {string} */ subnavLinkSize: string;
    /** @type {number} */ subnavLinkWeight: number;
    /** @type {string} */ subnavLinkActiveColor: string;
    /** @type {string} */ subnavActiveBg: string;
    /** @type {string} */ subnavActiveColor: string;
    /** @type {string} */ subnavActiveWeight: string;
    /** @type {string} */ subnavActiveRadius: string;
    /** @type {boolean} */ wrapLvl2Legacy: boolean;
    /** @type {string} */ dropdownBg: string;
    /** @type {string} */ dropdownMinWidth: string;
    /** @type {string} */ dropdownShadow: string;
    /** @type {string} */ dropdownItemPadding: string;
    /** @type {string} */ dropdownTextColor: string;
    /** @type {string} */ dropdownTextSize: string;
    /** @type {boolean} */ wrapLvl3: boolean;
    /** @type {string} */ dropdownHoverBg: string;
    /** @type {string} */ dropdownHoverColor: string;
}
