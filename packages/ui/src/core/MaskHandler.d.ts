export class MaskHandler {
    constructor(mask: any);
    mask: any;
    raw: string;
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
