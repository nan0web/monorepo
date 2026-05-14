#!/usr/bin/env node

/**
 * @nan0web/icons — CLI Sandbox
 *
 * Демонструє використання іконок у терміналі.
 *
 * Usage: node play/ui-cli/index.js
 */

import { toSvg } from '../../src/index.js'
import { iconChar } from '../../src/adapters/cli.js'
import {
	BsBank2,
	BsLightningCharge,
	BsStar,
	BsHeart,
	BsSun,
	BsMoon,
	BsGear,
	BsSearch,
} from '../../src/sets/bs.js'

const ICONS = [
	{ data: BsBank2, name: 'BsBank2', label: 'Відділення' },
	{ data: BsLightningCharge, name: 'BsLightningCharge', label: 'Чергове' },
	{ data: BsStar, name: 'BsStar', label: 'Обране' },
	{ data: BsHeart, name: 'BsHeart', label: 'Улюблене' },
	{ data: BsSun, name: 'BsSun', label: 'Світла тема' },
	{ data: BsMoon, name: 'BsMoon', label: 'Темна тема' },
	{ data: BsGear, name: 'BsGear', label: 'Налаштування' },
	{ data: BsSearch, name: 'BsSearch', label: 'Пошук' },
]

console.log()
console.log('  ╔══════════════════════════════════════════╗')
console.log('  ║   @nan0web/icons — CLI Sandbox           ║')
console.log('  ╚══════════════════════════════════════════╝')
console.log()

// Unicode icon chars
console.log('  🎯 Unicode Icons (iconChar):')
console.log('  ─────────────────────────────')
for (const { data, name, label } of ICONS) {
	const char = iconChar({ _name: name })
	console.log(`  ${char}  ${label.padEnd(20)} (${name})`)
}
console.log()

// SVG string output
console.log('  📐 SVG Output (toSvg):')
console.log('  ─────────────────────────────')
const svg = toSvg(BsBank2, { size: 16 })
console.log(`  BsBank2 SVG length: ${svg.length} chars`)
console.log(`  Starts with: ${svg.slice(0, 50)}...`)
console.log()

// Stats
console.log('  📊 Stats:')
console.log(`  Bootstrap Icons demonstrated: ${ICONS.length}`)
console.log()
