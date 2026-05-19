import { defineConfig } from 'vite'

export default defineConfig({
	root: './',
	base: './',
	resolve: {
		preserveSymlinks: true,
		alias: [
			{ find: /^\@nan0web\/editor$/, replacement: '/Users/i/src/nan.web/packages/editor/src/core/index.js' },
			{ find: /^\@nan0web\/db-browser$/, replacement: '/Users/i/src/nan.web/packages/db-browser/src/index.js' },
			{ find: /^\@nan0web\/db$/, replacement: '/Users/i/src/nan.web/packages/db/src/index.js' },
			{ find: /^\@nan0web\/db\/path$/, replacement: '/Users/i/src/nan.web/packages/db/src/DB/path.js' },
			{ find: /^\@nan0web\/ui-lit$/, replacement: '/Users/i/src/nan.web/packages/ui-lit/src/index.js' },
			{ find: /^\@nan0web\/ui$/, replacement: '/Users/i/src/nan.web/packages/ui/src/index.js' },
			{ find: /^\@nan0web\/ui\/core$/, replacement: '/Users/i/src/nan.web/packages/ui/src/core/index.js' },
			{ find: /^\@nan0web\/ui\/components$/, replacement: '/Users/i/src/nan.web/packages/ui/src/Component/index.js' },
			{ find: /^\@nan0web\/ui\/models$/, replacement: '/Users/i/src/nan.web/packages/ui/src/Model/index.js' },
			{ find: /^\@nan0web\/ui\/domain$/, replacement: '/Users/i/src/nan.web/packages/ui/src/domain/index.js' },
			{ find: /^\@nan0web\/event$/, replacement: '/Users/i/src/nan.web/packages/event/src/index.js' },
			{ find: /^\@nan0web\/event\/oop$/, replacement: '/Users/i/src/nan.web/packages/event/src/oop.js' },
			{ find: /^\@nan0web\/log$/, replacement: '/Users/i/src/nan.web/packages/log/src/index.js' },
			{ find: /^\@nan0web\/types$/, replacement: '/Users/i/src/nan.web/packages/types/src/index.js' },
			{ find: /^\@nan0web\/auth.app$/, replacement: '/Users/i/src/nan.web/apps/auth.app/src/index.js' },
		],
	},
	server: {
		port: 4246,
		strictPort: true,
	},
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		rollupOptions: {
			external: [
				'node:crypto',
				'node:fs',
				'node:path',
				'node:os',
				'node:child_process',
			],
		},
	},
})
