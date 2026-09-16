export class AppEditor extends LitElement {
    static properties: {
        url: {
            type: StringConstructor;
        };
        debug: {
            type: BooleanConstructor;
        };
    };
    static styles: import("lit").CSSResult;
    render(): import("lit").TemplateResult<1>;
}
import { LitElement } from 'lit';
