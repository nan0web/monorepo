export default class InterceptorInput {
    /**
     *
     * @param {object} input
     * @param {MDElement} input.element
     * @param {MDElement[]} [input.path=[]]
     */
    constructor(input: {
        element: MDElement;
        path?: MDElement[] | undefined;
    });
    /** @type {MDElement} */
    element: MDElement;
    /** @type {MDElement[]} */
    path: MDElement[];
}
import MDElement from './MDElement.js';
