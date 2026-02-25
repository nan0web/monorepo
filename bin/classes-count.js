import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

async function* walkDir(dir) {
	for (const f of await readdir(dir, { withFileTypes: true })) {
		const entry = join(dir, f.name)
		if (f.isDirectory() && !f.name.startsWith('.')) {
			yield* walkDir(entry)
		} else if (/\.(jsx?|tsx?|mjs?|md|yaml|yml|nano)$/.test(f.name)) {
			yield entry
		}
	}
}

async function countClasses() {
	const packagesDir = join(process.cwd(), 'packages')
	let totalClasses = 0,
		totalJs = 0,
		totalJsx = 0,
		totalData = 0,
		totalTests = 0
	const packageCounts = {}

	for await (const file of walkDir(packagesDir)) {
		const content = await readFile(file, 'utf-8')
		const classMatches = content.match(/(^|\n)\s*class\s+\w+/g) || []
		const rel = file.slice(packagesDir.length)
		const [space, pkgName, ...paths] = rel.split('/')
		const path = paths.join('/')
		if (['/dist/', '/.cache/', '/bundle/', '/types/'].some((s) => path.startsWith())) {
			continue
		}
		if (path.endsWith('.test.js') || path.endsWith('.test.jsx')) {
			++totalTests
		} else if (path.endsWith('.js')) {
			++totalJs
		} else if (path.endsWith('.jsx')) {
			++totalJsx
		} else if (['.yaml', '.yml', '.nano', '.md'].some((e) => path.endsWith(e))) {
			++totalData
		}

		if (classMatches.length > 0) {
			packageCounts[pkgName] = (packageCounts[pkgName] || 0) + classMatches.length
			totalClasses += classMatches.length
		}
	}

	// Створюємо Круг Сутності
	console.log('\n🌙 Коло Сутності @nan0web:')
	console.log(`Загалом: ${totalClasses} класів`)
	console.log(`Загалом: ${totalJs} .js файлів`)
	console.log(`Загалом: ${totalJsx} .jsx компонентів`)
	console.log(`Загалом: ${totalTests} тестів`)
	console.log(`Загалом: ${totalData} даних`)
	console.log('—'.repeat(30))

	Object.entries(packageCounts)
		.sort((a, b) => b[1] - a[1])
		.forEach(([pkg, count]) => {
			const ratio = ((count / totalClasses) * 100).toFixed(1)
			console.log(`${pkg.padEnd(20)} ${count.toString().padStart(3)} (${ratio}%)`)
		})

	// Перевірка гармонії
	const isHarmonious = Object.values(packageCounts).every((count) => count < totalClasses * 0.7)
	console.log('\n гармонія:', isHarmonious ? '✅ баланс сутностей' : '⚠️ дисбаланс у структурі')
}

countClasses()
