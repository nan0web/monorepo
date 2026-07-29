export default class Renderer {
    /**
     * @param {object} state - Global State from AppRunner.
     */
    constructor(state?: object);
    /** @type {object} */
    state: object;
    /**
     * Register a custom App-component renderer.
     * Used by micro-apps: renderer.register('App.Auth.LogIn', renderLoginFn)
     *
     * @param {string} type - Block type identifier.
     * @param {Function} handler - Render function (props, ctx) => Renderable.
     */
    register(type: string, handler: Function): void;
    /**
     * Render a page given its layout and source binding.
     *
     * @param {import('../domain/Page.js').default} page
     * @returns {Array<object>} - Renderable blocks for UI adapters.
     */
    render(page: import("../domain/Page.js").default): Array<object>;
    /**
     * Render a custom block type via registry.
     *
     * @param {string} type - e.g. 'App.Auth.LogIn'
     * @param {object} props
     * @returns {object | null}
     */
    renderBlock(type: string, props?: object): object | null;
    #private;
}
