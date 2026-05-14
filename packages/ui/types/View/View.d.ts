/**
 * @typedef {Object} ComponentFn
 * @property {string} name
 * @property {(input: UiMessage) => Promise<any>} ask
 * @property {Function} bind
 */
export default class View {
    /** @type {typeof RenderOptions} */
    static RenderOptions: typeof RenderOptions;
    /** @type {typeof FrameRenderMethod} */
    static RenderMethod: typeof FrameRenderMethod;
    /**
     * @param {Frame} frame
     * @param {RenderOptions} [options]
     * @returns {Frame}
     */
    static fixFrame(frame: Frame, options?: RenderOptions): Frame;
    /**
     * @param {object} [input]
     * @param {StdIn} [input.stdin]
     * @param {StdOut} [input.stdout]
     * @param {number} [input.startedAt]
     * @param {Frame} [input.frame]
     * @param {Locale} [input.locale]
     * @param {Map<string, string>} [input.vocab]
     * @param {number[]} [input.windowSize]
     * @param {Map<string, ComponentFn>} [input.components]
     * @param {string} [input.renderMethod]
     */
    constructor(input?: {
        stdin?: StdIn | undefined;
        stdout?: StdOut | undefined;
        startedAt?: number | undefined;
        frame?: Frame | undefined;
        locale?: Locale | undefined;
        vocab?: Map<string, string> | undefined;
        windowSize?: number[] | undefined;
        components?: Map<string, ComponentFn> | undefined;
        renderMethod?: string | undefined;
    });
    /** @type {StdIn} */
    stdin: StdIn;
    /** @type {StdOut} */
    stdout: StdOut;
    /** @type {number} */
    startedAt: number;
    /** @type {Frame} */
    frame: Frame;
    /** @type {Locale} */
    locale: Locale;
    /** @type {Map<string, string>} */
    vocab: Map<string, string>;
    /** @type {number[]} */
    windowSize: number[];
    /** @type {Map<string, ComponentFn>} */
    components: Map<string, ComponentFn>;
    /** @type {string} */
    renderMethod: string;
    get empty(): boolean;
    get RenderMethod(): typeof FrameRenderMethod;
    get RenderOptions(): typeof RenderOptions;
    getWindowSize(): number[];
    /**
     * @param {number} width
     * @param {number} height
     */
    setWindowSize(width: number, height: number): void;
    startTimer(): void;
    spent(checkpoint?: number): number;
    /**
     * @param {boolean | number | Function | ComponentFn} [shouldRender=0]
     * @param {RenderOptions} [options]
     * @returns {(value: Frame|string|string[], ...args: any) => Frame}
     */
    render(shouldRender?: boolean | number | Function | ComponentFn, options?: RenderOptions): (value: Frame | string | string[], ...args: any) => Frame;
    clear(shouldRender?: number): Frame;
    progress(shouldRender?: boolean): (value: any) => Frame;
    /** @param {any} value */
    t(value: any): any;
    /** @param {any[]} args */
    debug(...args: any[]): Frame;
    /** @param {any[]} args */
    info(...args: any[]): Frame;
    /** @param {any[]} args */
    warn(...args: any[]): Frame;
    /** @param {any[]} args */
    error(...args: any[]): Frame;
    /**
     * @param {string} name
     * @param {ComponentFn} component
     */
    register(name: string, component: ComponentFn): void;
    /**
     * @param {string} name
     */
    unregister(name: string): void;
    /**
     * @param {string} name
     * @returns {boolean}
     */
    has(name: string): boolean;
    /**
     * @param {string} name
     * @returns {ComponentFn | undefined}
     */
    get(name: string): ComponentFn | undefined;
    /**
     * @param {UiMessage} input
     * @returns {Promise<UiMessage | null>}
     */
    ask(input: UiMessage): Promise<UiMessage | null>;
}
export type ComponentFn = {
    name: string;
    ask: (input: UiMessage) => Promise<any>;
    bind: Function;
};
import StdIn from '../StdIn.js';
import StdOut from '../StdOut.js';
import Frame from '../Frame/Frame.js';
import Locale from '../Locale.js';
import { FrameRenderMethod } from '../Frame/Frame.js';
import RenderOptions from './RenderOptions.js';
import UiMessage from '../core/Message/Message.js';
