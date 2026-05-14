import AccessControl from '../AccessControl.js'

/**
 * Server-side AccessControl.
 * After the auth-core refactoring, the base AccessControl already handles
 * all I/O via AuthDB. This class remains for backward compatibility.
 *
 * @deprecated Use AccessControl directly — it delegates to @nan0web/auth-core.
 */
export default class ServerAccessControl extends AccessControl {}
