export class DemoCounter extends LitElement {
    static properties: {
        title: {
            type: StringConstructor;
        };
        startValue: {
            type: NumberConstructor;
            attribute: string;
        };
        count: {
            type: NumberConstructor;
            state: boolean;
        };
    };
    static styles: import("lit").CSSResult;
    startValue: number;
    count: any;
    _increment(): void;
    render(): import("lit").TemplateResult<1>;
}
import { LitElement } from 'lit';
