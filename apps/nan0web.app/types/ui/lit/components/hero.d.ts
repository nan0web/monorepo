export class UIHero extends LitElement {
    static properties: {
        badge: {
            type: StringConstructor;
        };
        title: {
            type: StringConstructor;
        };
        subtitle: {
            type: StringConstructor;
        };
        install: {
            type: StringConstructor;
        };
        cta: {
            type: StringConstructor;
        };
        ctaHref: {
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
