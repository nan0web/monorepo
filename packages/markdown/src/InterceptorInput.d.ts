import MDElement from './MDElement.js';
export default class InterceptorInput {
    /** @type {MDElement} */
    element: MDElement;
    /** @type {MDElement[]} */
    path: MDElement[];
    /**
     *
     * @param {object} input
     * @param {MDElement} input.element
     * @param {MDElement[]} [input.path=[]]
     */
    constructor(input: {
        element: MDElement;
        path?: MDElement[];
    });
}
