/**
 * NaN0 VSCode Editor Component.
 * Acts as a bridge between VS Code and the logic.
 */
export class NaN0Editor extends LitElement {
    static properties: {
        content: {
            type: ArrayConstructor;
        };
        mode: {
            type: StringConstructor;
        };
        uri: {
            type: StringConstructor;
        };
    };
    static styles: import("lit").CSSResult;
    content: any[];
    mode: string;
    uri: string;
    render(): import("lit").TemplateResult<1>;
    #private;
}
import { LitElement } from 'lit';
