/**
 * System Roles Constants
 */
export declare const ROLES: Readonly<{
    ADMIN: "admin";
    MANAGER: "manager";
    USER: "user";
    PUBLIC: "public";
}>;
/**
 * Standard Access Control Presets for Model-as-Schema
 */
export declare const DEFAULT_ACCESS: Readonly<{
    read: true;
    create: ("admin" | "manager")[];
    update: ("admin" | "manager")[];
    delete: "admin"[];
}>;
