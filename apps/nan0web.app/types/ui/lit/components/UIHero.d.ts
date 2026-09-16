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
        code: {
            type: StringConstructor;
        };
        cta: {
            type: StringConstructor;
        };
        ctaHref: {
            type: StringConstructor;
        };
    };
    static styles: import("lit").CSSResult;
    render(): import("lit").TemplateResult<1>;
}
import { LitElement } from 'lit';
