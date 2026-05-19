/**
 * @docs
 * # CLI Entry Point
 *
 * Точка входу для командного рядка.
 *
 * ### Usage
 * ```bash
 * # Interactive mode (menu)
 * node main.js
 *
 * # Direct command
 * node main.js login --username=test --password=secret
 *
 * # Help
 * node main.js --help
 * ```
 */
export default function main(): Promise<void>;
