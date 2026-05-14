
import { chromium } from 'playwright';

async function inspectPlayground() {
	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext();
	const page = await context.newPage();

	let port = '4246';
	try {
		const { readFileSync, existsSync } = await import('node:fs');
		if (existsSync('.port')) port = readFileSync('.port', 'utf8').trim();
	} catch (e) {}

	const url = `http://localhost:${port}/`;
	console.log(`\x1b[36m🔍 Connecting to ${url}...\x1b[0m`);

	try {
		await page.goto(url, { timeout: 10000 });
	} catch (e) {
		console.error(`\x1b[31m❌ Failed to connect to ${url}. Is 'pnpm play' running?\x1b[0m`);
		await browser.close();
		process.exit(1);
	}

	console.log(`\x1b[32m✅ Page loaded. Extracting components...\x1b[0m\n`);

	const sections = await page.$$eval('[id^="block-"]', (sectionEls) => {
		return sectionEls.map(section => {
			const title = section.querySelector('h2')?.innerText?.replace('📦 ', '') || 'Unknown';
			const examples = Array.from(section.querySelectorAll('.mb-4')).map(example => {
				const label = example.querySelector('h6')?.innerText || 'Default';

				const previewEl = example.querySelector('.example-preview');
				const previewText = previewEl ? previewEl.innerText.trim() : '';

				const jsxCard = Array.from(example.querySelectorAll('.card')).find(c =>
					c.querySelector('.card-header')?.innerText?.includes('JSX')
				);
				const jsxCode = jsxCard ? jsxCard.querySelector('pre')?.innerText.trim() : '';

				const yamlCard = Array.from(example.querySelectorAll('.card')).find(c =>
					c.querySelector('.card-header')?.innerText?.includes('YAML')
				);
				const yamlCode = yamlCard ? yamlCard.querySelector('pre')?.innerText.trim() : '';

				return { label, previewText, jsxCode, yamlCode };
			});
			return { title, examples };
		});
	});

	let errors = 0;
	let total = 0;

	for (const section of sections) {
		console.log(`\x1b[1;34m📦 ${section.title}\x1b[0m`);
		for (const ex of section.examples) {
			total++;
			const status = validateConsistency(ex);
			if (status.ok) {
				console.log(`  \x1b[32m✔\x1b[0m ${ex.label.padEnd(30)} \x1b[90m(OK)\x1b[0m`);
			} else {
				errors++;
				console.log(`  \x1b[31m✘\x1b[0m ${ex.label.padEnd(30)} \x1b[31m(MISMATCH!)\x1b[0m`);
				console.log(`      \x1b[90mRender Text:\x1b[0m "${ex.previewText.slice(0, 60)}..."`);
				console.log(`      \x1b[90mJSX Code:\x1b[0m    "${ex.jsxCode.slice(0, 60)}..."`);
				console.log(`      \x1b[33mReason: ${status.reason}\x1b[0m\n`);
			}
		}
		console.log('');
	}

	if (errors === 0) {
		console.log(`\x1b[1;32m✅ ALL ${total} EXAMPLES ARE CONSISTENT!\x1b[0m`);
	} else {
		console.log(`\x1b[1;31m❌ FOUND ${errors} / ${total} MISMATCHES!\x1b[0m`);
		console.log(`\x1b[90mRun with AI to fix these automatically.\x1b[0m`);
		process.exit(1);
	}

	await browser.close();
}

function validateConsistency({ label, previewText, jsxCode, yamlCode }) {
	if (!jsxCode && !yamlCode) return { ok: true }; // Info-only block Maybe

	// 1. Basic inclusion check: If Render shows a specific text, 
	// it should be present in JSX or YAML code (unless it's complex/formatted).
	// We normalize by removing markdown chars for comparison.
	const normalizedRender = previewText.toLowerCase().replace(/[#*_`-]/g, '').trim();
	const normalizedJsx = jsxCode.toLowerCase().replace(/[#*_`-]/g, '').trim();

	// Check for obvious хардкод mismatches:
	// Example: Render says "Markdown", but JSX contains "# Заголовок"
	if (normalizedJsx.includes('заголовок') && !normalizedRender.includes('заголовок')) {
		return { ok: false, reason: 'Hardcoded placeholder "Заголовок" found in Code but not in Render.' };
	}

	if (normalizedRender.includes('справжній markdown') && !normalizedJsx.includes('справжній markdown')) {
		return { ok: false, reason: 'Actual content "Справжній Markdown" missing from Code example.' };
	}

	// 2. Cross-check JSX vs YAML if both exist
	if (jsxCode && yamlCode) {
		// Just a shallow check if Markdown component usage is same
		if (jsxCode.includes('Markdown') && !yamlCode.includes('Markdown')) {
			return { ok: false, reason: 'Component type mismatch between JSX and YAML.' };
		}
	}

	return { ok: true };
}

inspectPlayground();
