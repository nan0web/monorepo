export class UICodeBlock extends LitElement {
    static properties: {
        language: {
            type: StringConstructor;
        };
        code: {
            type: StringConstructor;
        };
    };
    static styles: import("lit").CSSResult;
    render(): import("lit").TemplateResult<1>;
}
import { LitElement } from 'lit';
