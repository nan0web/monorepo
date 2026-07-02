/**
 * ShareWeb — Unified Web UI for the @nan0web/share.app media pipeline.
 * Exposes research, generation, and distribution workflows in a responsive, rich glassmorphic interface.
 */
export class ShareWeb extends LitElement {
    static properties: {
        model: {
            type: ObjectConstructor;
        };
        _logs: {
            type: ArrayConstructor;
            state: boolean;
        };
        _loading: {
            type: BooleanConstructor;
            state: boolean;
        };
        _trends: {
            type: ArrayConstructor;
            state: boolean;
        };
        _rulesContent: {
            type: ObjectConstructor;
            state: boolean;
        };
        _rulesOutput: {
            type: ArrayConstructor;
            state: boolean;
        };
    };
    static styles: import("lit").CSSResult;
    _logs: any[];
    _loading: boolean;
    _trends: any[];
    _rulesContent: {
        text: string;
        tags: string;
        type: string;
        lang: string;
    };
    _rulesOutput: any[];
    log(msg: any): void;
    runTrendAnalysis(): Promise<void>;
    compileVideo(): Promise<void>;
    generateShorts(): Promise<void>;
    evaluateRuleset(): void;
    render(): import("lit").TemplateResult<1>;
}
import { LitElement } from 'lit';
