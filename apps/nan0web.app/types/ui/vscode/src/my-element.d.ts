/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class MyElement extends LitElement {
    static get properties(): {
        /**
         * Copy for the read the docs hint.
         */
        docsHint: {
            type: StringConstructor;
        };
        /**
         * The number of times the button has been clicked.
         */
        count: {
            type: NumberConstructor;
        };
    };
    static get styles(): import("lit").CSSResult;
    docsHint: string;
    count: number;
    render(): import("lit").TemplateResult<1>;
    _onClick(): void;
}
import { LitElement } from 'lit';
