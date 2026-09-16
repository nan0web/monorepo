/**
 * @file CatalogWatcherModel — Client-side catalog subscription watcher.
 *
 * Periodically checks a remote `.index.txt` for changes via HTTP HEAD/GET.
 * Emits intents when catalog is updated, unchanged, or on error.
 * Works in CLI, Browser, PWA Service Worker, AI Agent — any OLMUI adapter.
 *
 * Default poll interval: 3600 seconds (1 hour).
 */
export class CatalogWatcherModel extends Model {
    static url: {
        help: string;
        default: string;
        type: string;
        hint: string;
        positional: boolean;
    };
    static interval: {
        help: string;
        default: number;
        type: string;
        hint: string;
    };
    static lastHash: {
        help: string;
        default: string;
        type: string;
        hidden: boolean;
    };
    static lastCheck: {
        help: string;
        default: string;
        type: string;
        hidden: boolean;
    };
    static status: {
        help: string;
        default: string;
        type: string;
        options: {
            value: string;
            label: string;
        }[];
        hint: string;
    };
    static autoConfirm: {
        help: string;
        default: boolean;
        type: string;
        hint: string;
    };
    static lastIndex: {
        help: string;
        default: any;
        hidden: boolean;
    };
    static Status: {
        IDLE: string;
        CHECKING: string;
        UPDATED: string;
        UNCHANGED: string;
        ERROR: string;
    };
    static UI: {
        label_watching: string;
        label_updated: string;
        label_unchanged: string;
        label_checking: string;
        label_error: string;
        label_interval: string;
        label_lastCheck: string;
        label_items: string;
        label_version: string;
        label_download: string;
        label_downloaded: string;
        label_skipped: string;
        label_next_check: string;
        error_no_url: string;
        error_fetch: string;
        error_parse: string;
        progress_init: string;
        progress_checking: string;
    };
    static abort: {
        user_cancelled: string;
        timeout: string;
    };
    /**
     * Single check cycle. Returns whether catalog was updated.
     *
     * @param {{ fetch: (url: string, init?: RequestInit) => Promise<Response> }} env
     * Environment-injected fetch (allows testing without real network).
     */
    check(env: {
        fetch: (url: string, init?: RequestInit) => Promise<Response>;
    }): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").LogIntent | import("@nan0web/ui/src/core/Intent.js").ProgressIntent | import("@nan0web/ui/src/core/Intent.js").AskIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
    status: string;
    lastCheck: string;
    lastHash: any;
    lastIndex: CatalogIndexModel;
    /**
     * Continuous watching loop. Yields intents on every cycle.
     * Runs indefinitely until adapter sends abort.
     *
     * @param {{ fetch: (url: string, init?: RequestInit) => Promise<Response>, sleep: (ms: number) => Promise<void> }} env
     */
    watch(env: {
        fetch: (url: string, init?: RequestInit) => Promise<Response>;
        sleep: (ms: number) => Promise<void>;
    }): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ResultIntent | import("@nan0web/ui/src/core/Intent.js").LogIntent | import("@nan0web/ui/src/core/Intent.js").ProgressIntent | import("@nan0web/ui/src/core/Intent.js").AskIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
import { Model } from '@nan0web/types';
import { CatalogIndexModel } from './CatalogIndexModel.js';
