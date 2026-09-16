/**
 * Global ecosystem metadata.
 */
export default class EcosystemModel extends Model {
    static schema: {
        version: {
            type: string;
            default: string;
        };
        release_name: {
            type: string;
            default: string;
        };
        author: {
            type: string;
            default: string;
        };
        foundation_year: {
            type: string;
            default: number;
        };
        commercial_status: {
            type: string;
            default: string;
        };
        license: {
            type: string;
            default: string;
        };
        agents: {
            type: string;
            default: {
                antigravity: {
                    status: string;
                    role: string;
                };
                vscode: {
                    status: string;
                    role: string;
                };
                cursor: {
                    status: string;
                    role: string;
                };
            };
        };
    };
}
import { Model } from '@nan0web/ui';
