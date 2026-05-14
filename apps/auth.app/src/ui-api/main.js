import { createServer } from '@nan0web/http-node'
import ApiRouter from './router.js'
import AuthMessage from '../messages/Auth/Root.js'
import App from '../AuthApp.js'

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
export default function createServer2() {
	// @ts-ignore: Development test script
	const app = new App()
	const router = new ApiRouter(app).add(AuthMessage)

	return createServer({
		// @ts-ignore: Needs refactoring to match latest @nan0web/http-node API
		routes: router.routes,
	})
}

// Запуск сервера
if (import.meta.url === `file://${process.argv[1]}`) {
	const server = createServer2()
	// @ts-ignore
	server.listen(3000, () => {
		console.log('API server running at http://localhost:3000')
		console.log('Try POST /api/auth/login with { username, password } body')
	})
}
