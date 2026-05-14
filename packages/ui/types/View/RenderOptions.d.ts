export default RenderOptions;
declare class RenderOptions {
    static DEFAULTS: {
        resizeToView: boolean;
        translateFrame: boolean;
        render: boolean;
        renderMethod: string;
    };
    static from(props?: {}): RenderOptions;
    constructor(props?: {});
    /** @type {boolean} [false] */
    resizeToView: boolean;
    /** @type {boolean} [false] */
    translateFrame: boolean;
    /** @type {boolean} [true] */
    render: boolean;
    /** @type {string} */
    renderMethod: string;
    /** @type {number} */
    width: number;
    /** @type {number} */
    height: number;
    get DEFAULTS(): {
        resizeToView: boolean;
        translateFrame: boolean;
        render: boolean;
        renderMethod: string;
    };
}
