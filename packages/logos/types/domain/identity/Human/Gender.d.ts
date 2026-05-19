export default class HumanGender {
    static Name: typeof HumanName;
    /**
     * @param {*} input
     * @returns {HumanGender}
     */
    static from(input: any): HumanGender;
    /**
     * @param {string} str
     * @returns {HumanGender}
     */
    static parse(str: string): HumanGender;
    /**
     * @param {number | boolean} input
     */
    constructor(input: number | boolean);
    /** @type {number} */
    value: number;
    toString(): "men's gender" | "women's gender" | "unknown gender";
    toNumber(): number;
}
import HumanName from './Name.js';
