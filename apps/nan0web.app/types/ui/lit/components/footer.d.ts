export class UIFooter extends LitElement {
    static properties: {
        brand: {
            type: StringConstructor;
        };
        deployedWith: {
            type: StringConstructor;
        };
    };
    createRenderRoot(): this;
    render(): import("lit").TemplateResult<1>;
}
import { LitElement } from 'lit';
