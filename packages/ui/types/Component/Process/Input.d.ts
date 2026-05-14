export default ProcessInput;
/**
 * Represents input data for the Process component.
 * Holds configuration for rendering a progress bar.
 */
declare class ProcessInput {
    /**
     * Creates a ProcessInput instance from the given props.
     * @param {ProcessInput|object} props - The properties to create from
     * @returns {ProcessInput} A ProcessInput instance
     */
    static from(props?: ProcessInput | object): ProcessInput;
    /**
     * Creates a new ProcessInput instance.
     * @param {object} props - Process input properties
     * @param {string} [props.name="NaN•Coding"] - Process name
     * @param {number} [props.i=0] - Current progress index
     * @param {number} [props.top=9] - Top limit for progress normalization
     * @param {number} [props.width=9] - Width of the progress bar
     * @param {string} [props.space='•'] - Character for empty space
     * @param {string} [props.char='*'] - Character for filled progress
     */
    constructor(props?: {
        name?: string | undefined;
        i?: number | undefined;
        top?: number | undefined;
        width?: number | undefined;
        space?: string | undefined;
        char?: string | undefined;
    });
    /** @type {string} Process name to display */
    name: string;
    /** @type {number} Current progress index */
    i: number;
    /** @type {number} Top limit for progress normalization */
    top: number;
    /** @type {number} Width of the progress bar */
    width: number;
    /** @type {string} Character to use for empty space */
    space: string;
    /** @type {string} Character to use for filled progress */
    char: string;
    /**
     * Converts the input to a string representation.
     * @returns {string} String representation of the ProcessInput
     */
    toString(): string;
}
