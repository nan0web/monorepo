export type ButtonTheme = {
    color: string;
    background: string;
    shadow: string;
    hoverBackground: string;
    solid: any;
    outline: any;
    size: any;
    animation: any;
    borderColor: string;
    borderRadius: string;
    borderWidth: string;
    fontSize: string;
    paddingX: string;
    paddingY: string;
    fontFamily: string;
};
/**
 * Theme definition for Button atom.
 * Inherits common properties from Input and defines colour and shadow.
 *
 * @typedef {Object} ButtonTheme
 * @property {string} color
 * @property {string} background
 * @property {string} shadow
 * @property {string} hoverBackground
 * @property {Object} solid
 * @property {Object} outline
 * @property {Object} size
 * @property {Object} animation
 * @property {string} borderColor
 * @property {string} borderRadius
 * @property {string} borderWidth
 * @property {string} fontSize
 * @property {string} paddingX
 * @property {string} paddingY
 * @property {string} fontFamily
 */
/**
 * Button atom theme.
 * @type {ButtonTheme}
 */
declare const _default: ButtonTheme;
export default _default;
