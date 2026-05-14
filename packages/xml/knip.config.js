/** @type {import('knip').KnipConfig} */
export default {
	entry: ['src/index.js'],
	project: ['src/**/*.js'],
	ignore: ['play/**', 'releases/**', 'src/README.md.js'],
	ignoreDependencies: ['@nan0web/db', '@nan0web/db-fs', '@nan0web/log', '@nan0web/ui-cli'],
}
