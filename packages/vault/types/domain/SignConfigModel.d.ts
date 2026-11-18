/**
 * ImageFile - Visual asset file descriptor (e.g. stamp, signature).
 */
export class ImageFile extends Model {
    static src: {
        help: string;
        default: string;
    };
    static width: {
        help: string;
        default: string;
    };
    static height: {
        help: string;
        default: string;
    };
    /**
     * @param {Partial<ImageFile>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Partial<ImageFile>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string} Path to image file (SVG/PNG) */ src: string;
    /** @type {string} Image width (e.g. 200px) */ width: string;
    /** @type {string} Image height (e.g. 200px) */ height: string;
}
/**
 * Assets - Visual assets configuration for signing.
 */
export class Assets extends Model {
    static stamp: {
        help: string;
        type: typeof ImageFile;
        default: ImageFile;
    };
    /**
     * @param {Partial<Assets>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Partial<Assets>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {ImageFile} */ stamp: ImageFile;
}
/**
 * PgpConfig - PGP signing configuration.
 */
export class PgpConfig extends Model {
    static key_id: {
        help: string;
        default: string;
    };
    static armor: {
        help: string;
        default: boolean;
    };
    /**
     * @param {Partial<PgpConfig>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Partial<PgpConfig>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string} */ key_id: string;
    /** @type {boolean} */ armor: boolean;
}
/**
 * QesConfig - QES (qualified electronic signature / КЕП) configuration.
 */
export class QesConfig extends Model {
    static enabled: {
        help: string;
        default: boolean;
    };
    static provider: {
        help: string;
        default: string;
    };
    static command: {
        help: string;
        default: string;
    };
    static format: {
        help: string;
        default: string;
    };
    /**
     * @param {Partial<QesConfig>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Partial<QesConfig>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {boolean} Enable QES signing (.p7s) */ enabled: boolean;
    /** @type {string} QES provider (cli, eu-sign, diia) */ provider: string;
    /** @type {string} CLI command template for QES signing */ command: string;
    /** @type {string} Output signature file extension */ format: string;
}
/**
 * QrConfig - QR validation URL configuration.
 */
export class QrConfig extends Model {
    static base_url: {
        help: string;
        default: string;
    };
    /**
     * @param {Partial<QrConfig>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Partial<QrConfig>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string} */ base_url: string;
}
/**
 * SignConfigModel - Schema for `_.nan0` sign section with cascading inheritance.
 */
export class SignConfigModel extends Model {
    static alias: string;
    static assets: {
        help: string;
        type: typeof Assets;
        default: Assets;
    };
    static pgp: {
        help: string;
        type: typeof PgpConfig;
        default: PgpConfig;
    };
    static qes: {
        help: string;
        type: typeof QesConfig;
        default: QesConfig;
    };
    static qr: {
        help: string;
        type: typeof QrConfig;
        default: QrConfig;
    };
    static output: {
        help: string;
        default: string;
    };
    /**
     * @param {Partial<SignConfigModel>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Partial<SignConfigModel>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {Assets} Visual assets configuration */ assets: Assets;
    /** @type {PgpConfig} PGP signing configuration */ pgp: PgpConfig;
    /** @type {QesConfig} QES signing configuration */ qes: QesConfig;
    /** @type {QrConfig} QR validation configuration */ qr: QrConfig;
    /** @type {string} */ output: string;
}
import { Model } from '@nan0web/types';
