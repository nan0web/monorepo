/**
 * @file WebCommentAdapter — Browser overlay adapter for CommentModel.
 *
 * Renders the comment overlay UI in the browser:
 *   - Spotlight (hover highlight) layer
 *   - Inline comment form (textarea + Ctrl+Enter)
 *   - Badges on commented elements
 *   - Dashboard dialog (export/import/clear)
 *   - Comment list panel (view/edit/delete)
 *
 * Zero hardcode: all text comes from CommentModel.UI / CommentModel.*.help.
 * Zero validation: all logic lives in CommentModel.run(), executed via runGenerator.
 */
/**
 * @typedef {Object} WebAdapterOptions
 * @property {HTMLElement} [root] — Container element (defaults to document.body).
 * @property {{ save: Function, loadAll: Function, remove: Function, clear: Function }} db — IndexedDB adapter.
 * @property {(key: string) => string} [t] — Optional i18n translation function.
 */
export class WebCommentAdapter {
    /**
     * @param {WebAdapterOptions} options
     */
    constructor({ root, db, t }: WebAdapterOptions);
    /**
     * Start the comment overlay flow.
     * @returns {Promise<*>} — Final result from the generator.
     */
    start(): Promise<any>;
    /**
     * Abort the current flow.
     */
    stop(): void;
    /**
     * Show all existing comments in a list panel.
     */
    showCommentList(): Promise<void>;
    #private;
}
export type WebAdapterOptions = {
    /**
     * — Container element (defaults to document.body).
     */
    root?: HTMLElement;
    /**
     * — IndexedDB adapter.
     */
    db: {
        save: Function;
        loadAll: Function;
        remove: Function;
        clear: Function;
    };
    /**
     * — Optional i18n translation function.
     */
    t?: (key: string) => string;
};
