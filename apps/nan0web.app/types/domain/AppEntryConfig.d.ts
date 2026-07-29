/**
 * AppEntryConfig — Model-as-Schema для запису підключеного додатку.
 *
 * Описує лише те, що потрібно sub-app:
 * - name: унікальний ідентифікатор (App.{Name}.* у data YAML)
 * - src: джерело встановлення (npm пакет або локальний шлях)
 * - dsn: джерело даних (за замовчуванням — спільне з батьком)
 * - locale: локаль (може перевизначати батьківську)
 *
 * @property {string} appName Унікальний ідентифікатор додатку
 * @property {string} src Джерело встановлення (npm пакет або шлях)
 * @property {string} dsn Джерело даних
 * @property {string} locale Локаль додатку
 */
export default class AppEntryConfig extends Model {
    static appName: {
        alias: string;
        help: string;
        type: string;
        default: string;
        required: boolean;
    };
    static src: {
        help: string;
        type: string;
        placeholder: string;
        default: string;
        required: boolean;
    };
    static dsn: {
        help: string;
        type: string;
        default: string;
    };
    static locale: {
        help: string;
        type: string;
        default: string;
    };
    static isolation: {
        help: string;
        type: string;
        default: boolean;
    };
    /**
     * @param {object} [data]
     * @param {object} [options]
     */
    constructor(data?: object, options?: object);
    /** @returns {string} Alias accessor for appName */
    get name(): string;
    /** @type {string} */ appName: string;
    /** @type {string} */ src: string;
    /** @type {string} */ dsn: string;
    /** @type {string} */ locale: string;
    /** @type {boolean} */ isolation: boolean;
}
import { Model } from '@nan0web/types';
