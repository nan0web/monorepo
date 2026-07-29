/**
 * NaN0Web Config Schema — Model-as-Schema for config prompt.
 * Used by Form.createFromBodySchema() in ui-cli.
 *
 * Static fields → schema metadata (help, placeholder, type, default).
 *
 * @property {string} appName Назва проєкту
 * @property {string} dsn Джерело даних (папка або рядок підключення)
 * @property {string} locale Локаль за замовчуванням
 * @property {number} port Порт сервера
 * @property {'light' | 'dark' | 'auto'} theme Тема інтерфейсу
 * @property {'index' | 'README'} directoryIndex Який файл є індексом директорії (index.md або README.md)
 * @property {{ cert: string, key: string }} ssl TLS/SSL конфіг для HTTPS (шляхи до сертифікату та ключа)
 * @property {LogConfig} log Налаштування логування
 * @property {AppEntryConfig[]} apps Масив підключених додатків
 */
export default class NaN0WebConfig extends Model {
    static appName: {
        alias: string;
        help: string;
        placeholder: string;
        default: string;
        required: boolean;
    };
    static dsn: {
        help: string;
        placeholder: string;
        default: string;
    };
    static locale: {
        help: string;
        placeholder: string;
        default: string;
    };
    static port: {
        help: string;
        placeholder: string;
        default: number;
    };
    static theme: {
        help: string;
        placeholder: string;
        default: string;
    };
    static aliases: {
        help: string;
        type: string;
        default: {};
        hidden: boolean;
    };
    static directoryIndex: {
        help: string;
        placeholder: string;
        default: string;
    };
    static ui: {
        help: string;
        type: string;
        default: never[];
    };
    static ssl: {
        help: string;
        type: string;
        default: null;
        hidden: boolean;
    };
    static log: {
        help: string;
        type: string;
        hint: typeof LogConfig;
        default: {};
        hidden: boolean;
    };
    static apps: {
        help: string;
        type: string;
        hint: typeof AppEntryConfig;
        hidden: boolean;
        default: never[];
    };
    /**
     * @param {object} input
     * @returns {NaN0WebConfig}
     */
    static from(input: object): NaN0WebConfig;
    /**
     * @param {Partial<NaN0WebConfig>} [input]
     */
    constructor(input?: Partial<NaN0WebConfig>);
    /** @type {string} */ appName: string;
    /** @type {string} */ dsn: string;
    /** @type {string} */ locale: string;
    /** @type {number} */ port: number;
    /** @type {string} */ theme: string;
    /** @type {Record<string, string>} */ aliases: Record<string, string>;
    /** @type {string} */ directoryIndex: string;
    /** @type {string[]} */ ui: string[];
    /** @type {{ cert: string, key: string }|null} */ ssl: {
        cert: string;
        key: string;
    } | null;
    /** @type {LogConfig} */ log: LogConfig;
    /** @type {AppEntryConfig[]} */ apps: AppEntryConfig[];
}
import { Model } from '@nan0web/types';
import LogConfig from './LogConfig.js';
import AppEntryConfig from './AppEntryConfig.js';
