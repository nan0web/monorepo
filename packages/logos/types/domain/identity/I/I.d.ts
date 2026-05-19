export default I;
declare class I {
    static from(value: any): I;
    constructor(value: any);
    /** @type {string} */
    value: string;
    toString(): string;
}
