/**
 * @file CommentModel — Model-as-Schema for the universal comment/feedback overlay.
 *
 * A single comment attached to a DOM element or document section.
 * Activation modes: URL param (?comment=on), hotkey (Alt/Option), nav toggle (💬).
 *
 * Works as the OLMUI generator — the entire app logic lives here.
 * UI Adapters (Web overlay, CLI inspector, test harness) only react to yielded intents.
 */
export class CommentModel {
    static targetRef: {
        help: string;
        default: string;
        type: string;
        hidden: boolean;
    };
    static text: {
        help: string;
        default: string;
        type: string;
        hint: string;
        positional: boolean;
        validate: (val: any) => true | "error_text_required";
    };
    static author: {
        help: string;
        default: string;
        type: string;
        hint: string;
    };
    static url: {
        help: string;
        default: string;
        type: string;
        hidden: boolean;
    };
    static timestamp: {
        help: string;
        default: string;
        type: string;
        hidden: boolean;
    };
    static viewport: {
        help: string;
        default: any;
        type: string;
        hidden: boolean;
    };
    static mode: {
        help: string;
        default: string;
        type: string;
        options: {
            value: string;
            label: string;
        }[];
        hint: string;
    };
    static Mode: {
        OFF: string;
        URL: string;
        HOTKEY: string;
        TOGGLE: string;
    };
    static UI: {
        label_title: string;
        label_activate: string;
        label_deactivate: string;
        label_spotlight: string;
        label_select_element: string;
        label_form_title: string;
        label_badge: string;
        label_badge_count: string;
        label_saved: string;
        label_deleted: string;
        label_no_comments: string;
        label_read_comment: string;
        label_timestamp: string;
        label_dashboard: string;
        label_export: string;
        label_import: string;
        label_clear: string;
        label_exported: string;
        label_imported: string;
        label_cleared: string;
        error_text_required: string;
        error_no_target: string;
        error_save_failed: string;
        error_import_invalid: string;
        error_export_empty: string;
        progress_init: string;
        progress_saving: string;
        progress_loading: string;
        progress_exporting: string;
        progress_importing: string;
        progress_clearing: string;
        mode_off: string;
        mode_url: string;
        mode_hotkey: string;
        mode_toggle: string;
        icon_submit: string;
        icon_cancel: string;
        icon_close: string;
    };
    static abort: {
        user_cancelled: string;
        escape_pressed: string;
    };
    /**
     * @param {Partial<CommentModel>} [data]
     */
    constructor(data?: Partial<CommentModel>);
    /** @type {string} */
    targetRef: string;
    /** @type {string} */
    text: string;
    /** @type {string} */
    author: string;
    /** @type {string} */
    timestamp: string;
    /** @type {{ w: number, h: number } | null} */
    viewport: {
        w: number;
        h: number;
    } | null;
    /** @type {string} */
    mode: string;
    /**
     * Main flow (Generator):
     * Activates spotlight mode to select an element and add a comment.
     */
    run(env: any): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ProgressIntent | import("@nan0web/ui/src/core/Intent.js").AskIntent | import("@nan0web/ui/src/core/Intent.js").LogIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
    /**
     * Flow for creating a new comment.
     */
    createCommentFlow(env: any): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ProgressIntent | import("@nan0web/ui/src/core/Intent.js").AskIntent | import("@nan0web/ui/src/core/Intent.js").LogIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
    url: any;
    /**
     * Export all comments from storage as JSON.
     * @param {{ db: { loadAll: Function } }} env
     */
    exportComments(env: {
        db: {
            loadAll: Function;
        };
    }): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ProgressIntent | import("@nan0web/ui/src/core/Intent.js").LogIntent, {
        count: number;
        data?: undefined;
    } | {
        count: any;
        data: any;
    }, unknown>;
    /**
     * Import comments from a JSON payload provided by the adapter.
     * @param {{ db: { save: Function } }} env
     */
    importComments(env: {
        db: {
            save: Function;
        };
    }): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ProgressIntent | import("@nan0web/ui/src/core/Intent.js").AskIntent | import("@nan0web/ui/src/core/Intent.js").LogIntent, {
        count: number;
        error?: undefined;
    } | {
        count: number;
        error: string;
    }, unknown>;
    /**
     * Clear all comments from storage.
     * @param {{ db: { clear: Function } }} env
     */
    clearComments(env: {
        db: {
            clear: Function;
        };
    }): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ProgressIntent | import("@nan0web/ui/src/core/Intent.js").LogIntent, void, unknown>;
}
