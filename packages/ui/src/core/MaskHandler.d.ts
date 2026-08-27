/**
 * MaskHandler — Universal interactive mask controller.
 *
 * Supports masks where:
 *   `9`, `0`, `#` = digit placeholder
 *   `A` = letter placeholder
 *   `_` = any character placeholder
 *   anything else = literal (displayed as-is)
 *
 * Recognises the mask's static prefix (e.g. "+38" in "+38 (099) 999 9999")
 * and strips it from raw user input to avoid duplication.
 *
 * @module core/MaskHandler
 */
export declare class MaskHandler {
    mask: any;
    raw: string;
    constructor(mask: any);
    /** How many placeholder positions the mask has */
    get _slotCount(): number;
    /** Static prefix of the mask (literal characters before first placeholder) */
    get _prefix(): string;
    get isComplete(): boolean;
    get formatted(): string;
    /**
     * Append a digit/letter character.
     * Only accepts characters that fit into placeholders.
     *
     * @param {string} char
     * @returns {boolean} true if accepted
     */
    input(char: string): boolean;
    /**
     * Remove last character
     */
    backspace(): boolean;
    /**
     * Set a full value, intelligently stripping the mask's static prefix
     * if the user pasted or injected the full formatted number.
     *
     * e.g. setValue('+380660848404') with mask '+38 (099) 999 9999'
     *      strips "+38" → raw = '0660848404'
     *
     * @param {string} val
     */
    setValue(val: string): void;
}
