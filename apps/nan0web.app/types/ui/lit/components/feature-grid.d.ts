export class UIFeatureGrid extends LitElement {
    static properties: {
        id: {
            type: StringConstructor;
        };
        title: {
            type: StringConstructor;
        };
        data: {
            type: ObjectConstructor;
        };
    };
    createRenderRoot(): this;
    render(): import("lit").TemplateResult<1>;
}
import { LitElement } from 'lit';
