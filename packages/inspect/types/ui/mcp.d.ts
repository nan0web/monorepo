#!/usr/bin/env node
export const server: Server<{
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
            progressToken?: string | number;
            "io.modelcontextprotocol/related-task"?: {
                taskId: string;
            };
        };
    };
}, {
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
            progressToken?: string | number;
            "io.modelcontextprotocol/related-task"?: {
                taskId: string;
            };
        };
    };
}, {
    [x: string]: unknown;
    _meta?: {
        [x: string]: unknown;
        progressToken?: string | number;
        "io.modelcontextprotocol/related-task"?: {
            taskId: string;
        };
    };
}>;
export function runAuditor(AuditorClass: any, dir: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
}>;
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
