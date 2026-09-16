export class DemoUserProfile extends LitElement {
    static properties: {
        name: {
            type: StringConstructor;
        };
        role: {
            type: StringConstructor;
        };
        status: {
            type: StringConstructor;
        };
    };
    static styles: import("lit").CSSResult;
    render(): import("lit").TemplateResult<1>;
}
import { LitElement } from 'lit';
