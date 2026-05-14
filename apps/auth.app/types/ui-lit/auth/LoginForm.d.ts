export class AuthLoginForm extends LitElement {
    actionUrl: string;
    error: string;
    createRenderRoot(): this;
    handleSubmit(e: any): Promise<void>;
    render(): import("lit").TemplateResult<1>;
}
import { LitElement } from 'lit';
