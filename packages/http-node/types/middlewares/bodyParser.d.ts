/** @typedef {import("../messages/IncomingMessage.js").default} IncomingMessage */
/** @typedef {import("../messages/ServerResponse.js").default} ServerResponse */
/** @typedef {import("../server/Server.js").MiddlewareFn} MiddlewareFn */
export type IncomingMessage = import("../messages/IncomingMessage.js").default;
export type ServerResponse = import("../messages/ServerResponse.js").default;
export type MiddlewareFn = import("../server/Server.js").MiddlewareFn;
/**
 * Body parser middleware.
 * @returns {MiddlewareFn}
 */
declare function bodyParser(): MiddlewareFn;
export default bodyParser;
