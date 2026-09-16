export class UIHeader extends LitElement {
    static properties: {
        brand: {
            type: StringConstructor;
        };
        logo: {
            type: StringConstructor;
        };
        socials: {
            type: ArrayConstructor;
        };
        nav: {
            type: ArrayConstructor;
        };
        locale: {
            type: StringConstructor;
        };
        locales: {
            type: ArrayConstructor;
        };
        localeUrls: {
            type: ObjectConstructor;
        };
        theme: {
            type: StringConstructor;
        };
        _mobileOpen: {
            type: BooleanConstructor;
            state: boolean;
        };
    };
    static styles: import("lit").CSSResult;
    theme: string;
    locale: string;
    locales: any[];
    localeUrls: {};
    nav: any[];
    socials: any[];
    _mobileOpen: boolean;
    _onNavClick(e: any): void;
    _toggleMobile(): void;
    _onThemeChange(t: any): void;
    _onLocaleClick(e: any, loc: any, url: any): void;
    _renderLocale(): import("lit").TemplateResult<1>;
    _renderTheme(): import("lit").TemplateResult<1>;
    render(): import("lit").TemplateResult<1>;
}
import { LitElement } from 'lit';
