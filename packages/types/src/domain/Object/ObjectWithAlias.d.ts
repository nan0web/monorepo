/**
 * Class that supports property aliasing via static ALIAS map.
 * This is just a template that you can use for extension of your classes.
 * If you extend this class you need to overwrite `static from` anyway.
 *
 * @class ObjectWithAlias
 */
declare class ObjectWithAlias {
    static ALIAS: {};
    constructor(input?: {});
    /**
     * Factory method that maps aliased keys to their target names.
     *
     * @param {object} [props={}] - Source properties
     * @returns {ObjectWithAlias} Instance with aliases resolved
     */
    static from(props?: object): ObjectWithAlias;
}
export default ObjectWithAlias;
