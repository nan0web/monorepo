import { describe, it } from 'node:test'
import { verifySnapshot } from '@nan0web/play'
import DBFS from '@nan0web/db-fs'

// Авто-детекція мов з _/langs.yaml
const db = new DBFS({ root: 'data', cwd: import.meta.dirname + '/..' })
const doc = (await db.fetch('index').catch(() => ({}))) || {}
const langsDoc = (await db.fetch('_/langs').catch(() => [])) || []

const LANGUAGES = doc.langs?.map((l) => l.locale) || langsDoc?.map((l) => l.locale) || ['en', 'uk']

const SCENARIOS = [
	{ name: 'cli', demo: 'cli', entryPoint: 'play/cli.js' },
	{
		name: 'voice',
		demo: 'voice',
		entryPoint: 'play/voice.js',
		env: { PLAY_VOICE_HEADLESS: '1' },
	},
]

describe('Blueprint Snapshot Verification', () => {
	for (const lang of LANGUAGES) {
		describe(`[${lang}]`, () => {
			for (const s of SCENARIOS) {
				it(`${s.name} [${lang}]`, async () => {
					await verifySnapshot({
						name: `${s.name}.${lang}`,
						demo: s.demo,
						lang,
						env: { ...s.env },
						entryPoint: s.entryPoint,
					})
				})
			}
		})
	}
})
