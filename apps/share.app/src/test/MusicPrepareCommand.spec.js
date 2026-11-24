import { afterEach, beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { MusicPrepareCommand } from '../domain/commands/MusicPrepareCommand.js'
import { ShareAppCLI } from '../index.js'

async function runGen(gen) {
	const intents = []
	let finalResult = null
	while (true) {
		const next = await gen.next()
		if (next.done) {
			finalResult = next.value
			break
		}
		intents.push(next.value)
	}
	return { intents, finalResult }
}

describe('MusicPrepareCommand', () => {
	let workDir = ''
	let srcDir = ''
	let targetDir = ''

	beforeEach(() => {
		workDir = mkdtempSync(join(tmpdir(), 'music32-test-'))
		srcDir = join(workDir, 'src')
		targetDir = join(workDir, 'MUSIC32')
		mkdirSync(srcDir, { recursive: true })
	})

	afterEach(() => {
		if (workDir && existsSync(workDir)) {
			rmSync(workDir, { recursive: true, force: true })
		}
	})

	it('is registered in ShareAppCLI with alias music:prepare', () => {
		assert.equal(MusicPrepareCommand.alias, 'music:prepare')
		assert.ok(ShareAppCLI.command.options.includes(MusicPrepareCommand))
	})

	it('sanitizes FAT32 filenames and builds ID3v2.3 ffmpeg args', () => {
		const safe = MusicPrepareCommand.sanitizeFat32Name('Track: 01 <Live> / "Test"?.. ')
		assert.equal(safe, 'Track_ 01 _Live_ _ _Test__')

		const args = MusicPrepareCommand.buildFfmpegArgs('/in/song.flac', '/out/song.mp3', '320k')
		assert.ok(args.includes('-id3v2_version'))
		assert.equal(args[args.indexOf('-id3v2_version') + 1], '3')
		assert.equal(args[args.indexOf('-b:a') + 1], '320k')
		assert.equal(args[args.indexOf('-codec:a') + 1], 'libmp3lame')
	})

	it('initializes canonical MUSIC32 structure and transcodes audio via injected exec', async () => {
		writeFileSync(join(srcDir, 'song1.flac'), 'fake-flac-data')
		writeFileSync(join(srcDir, 'notes.txt'), 'ignore-me')

		const calls = []
		const mockExec = (cmd, args) => {
			calls.push({ cmd, args })
			return { status: 0, stdout: Buffer.alloc(0), stderr: Buffer.alloc(0) }
		}

		const cmd = new MusicPrepareCommand(
			{
				source: srcDir,
				target: targetDir,
				category: '01_Ukrainian',
				bitrate: '256k',
			},
			{ exec: mockExec },
		)

		const { finalResult } = await runGen(cmd.run())

		assert.equal(finalResult?.data?.ok, true)
		assert.equal(finalResult?.data?.processed, 1)
		assert.equal(finalResult?.data?.skipped, 0)
		assert.ok(existsSync(join(targetDir, 'Music/01_Ukrainian')))
		assert.ok(existsSync(join(targetDir, 'Music/02_Modern_Hits')))
		assert.ok(existsSync(join(targetDir, 'Music/03_Chill_Drive')))
		assert.ok(existsSync(join(targetDir, 'Audiobooks')))
		assert.equal(calls.length, 1)
		assert.equal(calls[0].cmd, 'ffmpeg')
		assert.ok(calls[0].args.includes(join(targetDir, 'Music/01_Ukrainian/song1.mp3')))
	})

	it('supports Audiobooks category and dryRun without executing ffmpeg', async () => {
		writeFileSync(join(srcDir, 'book.m4a'), 'fake-m4a')
		const calls = []
		const cmd = new MusicPrepareCommand(
			{
				source: srcDir,
				target: targetDir,
				category: 'Audiobooks',
				dryRun: true,
			},
			{
				exec: (c, a) => {
					calls.push({ c, a })
					return { status: 0, stdout: Buffer.alloc(0), stderr: Buffer.alloc(0) }
				},
			},
		)

		const { finalResult } = await runGen(cmd.run())
		assert.equal(finalResult?.data?.ok, true)
		assert.equal(finalResult?.data?.processed, 1)
		assert.equal(calls.length, 0)
		assert.equal(existsSync(join(targetDir, 'Audiobooks')), false)
	})

	it('rejects invalid category and invalid bitrate', async () => {
		const badCat = new MusicPrepareCommand({ category: '99_Unknown' })
		const resCat = await runGen(badCat.run())
		assert.equal(resCat.finalResult?.data?.ok, false)
		assert.equal(resCat.finalResult?.data?.reason, 'invalid_category')

		const badBitrate = new MusicPrepareCommand({ category: '01_Ukrainian', bitrate: '64k' })
		const resBit = await runGen(badBitrate.run())
		assert.equal(resBit.finalResult?.data?.ok, false)
		assert.equal(resBit.finalResult?.data?.reason, 'invalid_bitrate')
	})
})
