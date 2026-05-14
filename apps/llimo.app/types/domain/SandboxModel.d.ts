/**
 * @property {'none'|'docker'|'orb'|'linux'} sandbox Sandbox Engine (none|docker|orb|linux)
 * @property {string} dockerImage Docker Image (auto-resolved if empty)
 * @property {string} machine OrbStack Linux Machine Name (for linux/orb sandbox)
 */
export class SandboxModel extends Model {
    static sandbox: {
        help: string;
        default: string;
        options: string[];
        env: string;
    };
    static dockerImage: {
        help: string;
        alias: string;
        default: string;
        env: string;
    };
    static machine: {
        help: string;
        default: string;
    };
    /**
     * @param {Partial<SandboxModel> | Record<string, any>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions> & { db?: any, ai?: any }} [options]
     */
    constructor(data?: Partial<SandboxModel> | Record<string, any>, options?: Partial<import("@nan0web/types").ModelOptions> & {
        db?: any;
        ai?: any;
    });
    /** @type {any} Sandbox Engine (none|docker|orb|linux) */ sandbox: any;
    /** @type {any} Docker Image (auto-resolved if empty) */ dockerImage: any;
    /** @type {any} OrbStack Linux Machine Name (for linux/orb sandbox) */ machine: any;
    /**
     * Executes a command within the requested sandbox environment.
     * @param {string} cmd
     * @param {string[]} args
     * @param {object} options Options passed to runCommand (e.g. onData callback)
     */
    exec(cmd: string, args?: string[], options?: object): Promise<{
        stdout: string;
        stderr: string;
        exitCode: number;
    }>;
}
import { Model } from '@nan0web/types';
