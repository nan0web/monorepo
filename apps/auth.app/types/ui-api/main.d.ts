/**
 * @docs
 * # API Server
 *
 * Створює HTTP сервер з автоматичною маршрутизацією.
 *
 * ### Приклад запиту:
 * ```bash
 * curl -X POST http://localhost:3000/api/auth/login \
 *   -H "Content-Type: application/json" \
 *   -d '{"username":"test", "password":"secret"}'
 * ```
 */
export default function createServer2(): import("@nan0web/http-node").Server;
