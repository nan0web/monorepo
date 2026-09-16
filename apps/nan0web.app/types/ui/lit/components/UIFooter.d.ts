export class UIFooter extends LitElement {
    static properties: {
        license: {
            type: StringConstructor;
        };
        links: {
            type: ArrayConstructor;
        };
        year: {
            type: StringConstructor;
        };
    };
    static styles: import("lit").CSSResult;
    render(): import("lit").TemplateResult<1>;
}
import { LitElement } from 'lit';
