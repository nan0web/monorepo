/**
 * GDPRConsent Model
 *
 * Логіка згоди на використання cookies.
 */
export function GDPRConsent(options?: {}): Generator<{
    type: string;
    level: string;
    message: string;
    field?: undefined;
    schema?: undefined;
} | {
    type: string;
    message: string;
    level?: undefined;
    field?: undefined;
    schema?: undefined;
} | {
    type: string;
    field: string;
    schema: {
        title: string;
        help: string;
        options: {
            value: string;
            label: string;
        }[];
    };
    level?: undefined;
    message?: undefined;
}, {
    accepted: boolean;
    mode?: undefined;
} | {
    accepted: boolean;
    mode: any;
}, unknown>;
