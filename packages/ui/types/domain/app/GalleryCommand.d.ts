export class GalleryCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        unknownAction: string;
    };
    static action: {
        type: string;
        help: string;
        options: (typeof SnapshotAuditor | typeof GalleryRenderCommand)[];
        default: typeof SnapshotAuditor;
        positional: boolean;
    };
    /**
     * @param {Partial<GalleryCommand> | Record<string, any>} [data={}]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
     */
    constructor(data?: Partial<GalleryCommand> | Record<string, any>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {typeof SnapshotAuditor | typeof GalleryRenderCommand} */ action: typeof SnapshotAuditor | typeof GalleryRenderCommand;
    /** @type {string[]} */ _positionals: string[];
}
export default GalleryCommand;
import { ModelAsApp } from '../ModelAsApp.js';
import SnapshotAuditor from './SnapshotAuditor.js';
import GalleryRenderCommand from './GalleryRenderCommand.js';
