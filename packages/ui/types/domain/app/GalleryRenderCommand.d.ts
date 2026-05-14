export class GalleryRenderCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        rendering: string;
        success: string;
        failed: string;
    };
    static dataDir: {
        type: string;
        default: string;
        help: string;
    };
    static dir: {
        type: string;
        default: string;
        help: string;
    };
    /**
     * @param {Partial<GalleryRenderCommand> | Record<string, any>} [data={}]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
     */
    constructor(data?: Partial<GalleryRenderCommand> | Record<string, any>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string} */ dataDir: string;
    /** @type {string} */ dir: string;
}
export default GalleryRenderCommand;
import { ModelAsApp } from '../index.js';
