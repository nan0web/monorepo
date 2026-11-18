/**
 * SignApp - Sovereign document signing pipeline (`nan0vault sign <file.md>`).
 * Converts Markdown -> PDF (with stamp & QR) -> SHA-256 -> GPG detached signature.
 */
export class SignApp extends ModelAsApp {
    static alias: string;
    static UI: {
        errorNoFile: string;
        errorNoPdfDriver: string;
        stepResolving: string;
        stepRenderingPdf: string;
        stepSigningPgp: string;
        stepPgpSkipped: string;
        stepSigningQes: string;
        stepQesSkipped: string;
        warnAssetNotFound: string;
    };
    static file: {
        help: string;
        default: string;
    };
    /**
     * @param {Partial<SignApp>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions> & {
     *   pdf?: { render: (content: string, outPath: string, config: SignConfigModel) => Promise<Buffer|Uint8Array> },
     *   pgp?: { sign: (pdfBuffer: Buffer|Uint8Array, keyId: string, armor?: boolean) => Promise<string|Buffer> },
     *   qes?: { sign: (pdfBuffer: Buffer|Uint8Array, qesConfig: import('./SignConfigModel.js').QesConfig) => Promise<Buffer|Uint8Array> },
     *   sha256?: (buffer: Buffer|Uint8Array) => Promise<string> | string,
     * }} [options]
     */
    constructor(data?: Partial<SignApp>, options?: Partial<import("@nan0web/types").ModelOptions> & {
        pdf?: {
            render: (content: string, outPath: string, config: SignConfigModel) => Promise<Buffer | Uint8Array>;
        };
        pgp?: {
            sign: (pdfBuffer: Buffer | Uint8Array, keyId: string, armor?: boolean) => Promise<string | Buffer>;
        };
        qes?: {
            sign: (pdfBuffer: Buffer | Uint8Array, qesConfig: import("./SignConfigModel.js").QesConfig) => Promise<Buffer | Uint8Array>;
        };
        sha256?: (buffer: Buffer | Uint8Array) => Promise<string> | string;
    });
    /** @type {string} Path to the source markdown file (.md) */ file: string;
    $pdf: {
        render: (content: string, outPath: string, config: SignConfigModel) => Promise<Buffer | Uint8Array>;
    } | undefined;
    $pgp: {
        sign: (pdfBuffer: Buffer | Uint8Array, keyId: string, armor?: boolean) => Promise<string | Buffer>;
    } | undefined;
    $qes: {
        sign: (pdfBuffer: Buffer | Uint8Array, qesConfig: import("./SignConfigModel.js").QesConfig) => Promise<Buffer | Uint8Array>;
    } | undefined;
    $sha256: ((buffer: Buffer | Uint8Array) => Promise<string> | string) | undefined;
    /**
     * Executes the full signing pipeline.
     * @returns {AsyncGenerator<any, {
     *   config: SignConfigModel,
     *   pdfPath: string,
     *   sigPath: string | null,
     *   qesPath: string | null,
     *   sha256Path: string,
     *   sha256: string,
     * }, unknown>}
     */
    run(): AsyncGenerator<any, {
        config: SignConfigModel;
        pdfPath: string;
        sigPath: string | null;
        qesPath: string | null;
        sha256Path: string;
        sha256: string;
    }, unknown>;
}
import { ModelAsApp } from '@nan0web/ui';
import { SignConfigModel } from './SignConfigModel.js';
