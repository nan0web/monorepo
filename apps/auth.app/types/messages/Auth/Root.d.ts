export class RootBody {
    constructor(input?: {});
    /** @type {boolean} */
    debug: boolean;
}
export default class Root {
    static name: string;
    static help: string;
    static Children: (typeof LogInMessage)[];
    constructor(input?: {});
    /** @type {RootBody} */
    body: RootBody;
}
import LogInMessage from './LogIn.js';
