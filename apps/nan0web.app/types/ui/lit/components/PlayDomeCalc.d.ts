export class PlayDomeCalc extends LitElement {
    static properties: {
        radius: {
            type: NumberConstructor;
        };
        floors: {
            type: NumberConstructor;
        };
        hasBasement: {
            type: BooleanConstructor;
            attribute: string;
        };
    };
    static styles: import("lit").CSSResult;
    radius: number;
    floors: number;
    hasBasement: boolean;
    _updateRadius(e: any): void;
    _updateFloors(e: any): void;
    _updateBasement(e: any): void;
    render(): import("lit").TemplateResult<1>;
    #private;
}
import { LitElement } from 'lit';
