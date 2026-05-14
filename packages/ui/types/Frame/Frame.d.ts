export class FrameRenderMethod {
    static APPEND: string;
    static REPLACE: string;
    static VISIBLE: string;
}
/**
 * @link https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797 - ANSI escape codes
 */
export default class Frame {
    /** @type {typeof FrameRenderMethod} */
    static RenderMethod: typeof FrameRenderMethod;
    static Props: typeof FrameProps;
    /** @type {string} End of line */
    static EOL: string;
    /** @type {string} Beginning of line */
    static BOL: string;
    /** @type {string} Beginning of frame */
    static BOF: string;
    /** @type {string} Hide cursor */
    static HIDE_CURSOR: string;
    /** @type {string} Show cursor */
    static SHOW_CURSOR: string;
    /** @type {string} Tab */
    static TAB: string;
    /** @type {string} Bold */
    static BOLD: string;
    /** @type {string} Italic */
    static ITALIC: string;
    /** @type {string} Underline */
    static UNDERLINE: string;
    /** @type {string} Strikethrough */
    static STRIKETHROUGH: string;
    /** @type {string} Reset */
    static RESET: string;
    /** @type {string} Clear line */
    static CLEAR_LINE: string;
    /**
     * Check if a value can be used to create a Frame instance.
     * @param {*} value - Value to check.
     * @returns {boolean} True if the value is valid for Frame creation.
     */
    static is(value: any): boolean;
    /**
     * Create a Frame instance from input.
     * @param {*} input - Input value to convert.
     * @returns {Frame} A new Frame instance.
     */
    static from(input: any): Frame;
    /**
     * Create a function to space columns based on options.
     * @param {object} options - Spacing options.
     * @param {number[]} [options.cols=[]] - Widths of the columns.
     * @param {number} [options.padding=1] - Padding between columns.
     * @param {string[]} [options.aligns=[]] - Alignment for each column ('l' or 'r').
     * @returns {Function} Function that spaces a row.
     */
    static spaces(options?: {
        cols?: number[] | undefined;
        padding?: number | undefined;
        aligns?: string[] | undefined;
    }): Function;
    /**
     *
     * @param {Array} arr
     * @returns {(v) => number[]}
     */
    static weight(arr: any[]): (v: any) => number[];
    /**
     *
     * @param {object} options
     * @param {Function} [options.fn=(fn = v => v)] - Function to calculate weight.
     * @param {number[]} [options.cols=[]] - Widths of the columns.
     * @param {number} [options.padding=1] - The padding between columns.
     * @param {string[]} [options.aligns=[]] - The column aligns: l, r
     * @returns {(arr: []) => string[][]}
     */
    static table(options?: {
        fn?: Function | undefined;
        cols?: number[] | undefined;
        padding?: number | undefined;
        aligns?: string[] | undefined;
    }): (arr: []) => string[][];
    /**
     * Move cursor up by specified lines.
     * @param {number} [lines=1] - Number of lines to move up.
     * @returns {string} ANSI escape code for cursor movement.
     */
    static cursorUp(lines?: number): string;
    /**
     * Move cursor down by specified lines.
     * @param {number} [lines=1] - Number of lines to move down.
     * @returns {string} ANSI escape code for cursor movement.
     */
    static cursorDown(lines?: number): string;
    /**
     * Clear the current line.
     * @param {string} [str="\r"] - String to append after clearing.
     * @returns {string} ANSI escape code for line clearing followed by the string.
     */
    static clearLine(str?: string): string;
    /**
     * Clear the entire screen.
     * @returns {string} ANSI escape codes for screen clearing.
     */
    static clearScreen(): string;
    /**
     * @param {object} [input]
     * @param {string[]|string[][]} [input.value]
     * @param {number} [input.width]
     * @param {number} [input.height]
     * @param {string} [input.imprint]
     * @param {string} [input.renderMethod]
     * @param {FrameProps} [input.defaultProps]
     */
    constructor(input?: {
        value?: string[] | string[][] | undefined;
        width?: number | undefined;
        height?: number | undefined;
        imprint?: string | undefined;
        renderMethod?: string | undefined;
        defaultProps?: FrameProps | undefined;
    });
    /**
     * @example
     * ```js
     * new Frame([
     * 	["Hello", "World"],
     * 	[["Hello", { color: "red", bgColor: "#009" }], "World"],
     * 	["<b i fg=#900>Hello</b>", "<i>World</i>"],
     * ])
     * ```
     * @type {string[][]|any[][]}
     */
    value: string[][] | any[][];
    /** @type {FrameProps} */
    defaultProps: FrameProps;
    /** @type {string} */
    imprint: string;
    /** @type {number} */
    width: number;
    /** @type {number} */
    height: number;
    /** @type {string} */
    renderMethod: string;
    /**
     * Get whether the frame is empty.
     * @returns {boolean} True if the frame has no content.
     */
    get empty(): boolean;
    /**
     * Calculate the visual width of a string.
     * @param {string} str
     * @returns {number} The visual width of the string.
     */
    lengthOf(str: string): number;
    /**
     * Render the frame into a string representation.
     * @param {object} [options]
     * @param {string} [options.method] - Render method to use.
     * @param {FrameProps} [options.props] - Properties to apply during rendering.
     * @returns {string} The rendered frame as a string.
     */
    render(options?: {
        method?: string | undefined;
        props?: FrameProps | undefined;
    }): string;
    /**
     * Convert the frame to its string representation.
     * @returns {string} The frame's imprint.
     */
    toString(): string;
    /**
     * Transform each cell in the frame using a function.
     * @param {Function} fn - Function to apply to each cell.
     * @returns {Frame} A new Frame with transformed values.
     */
    transform(fn: Function): Frame;
    /**
     * Set the window size for the frame.
     * @param {number} width - The width of the window.
     * @param {number} height - The height of the window.
     */
    setWindowSize(width: number, height: number): void;
    #private;
}
import FrameProps from './Props.js';
