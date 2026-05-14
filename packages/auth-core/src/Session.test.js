import { suite, describe, it, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import Session from './Session.js'

suite('Session', () => {
	/** @type {string} */
	let tmpDir

	afterEach(() => {
		if (tmpDir) rmSync(tmpDir, { recursive: true, force: true })
	})

	function makeTmp() {
		tmpDir = mkdtempSync(join(tmpdir(), 'nan0-session-'))
		return tmpDir
	}

	describe('save() + load()', () => {
		it('round-trips email', () => {
			const dir = makeTmp()
			const s = new Session(join(dir, 'session.json'))
			s.save('test@yaro.page')
			assert.equal(s.load(), 'test@yaro.page')
		})

		it('overwrites previous session', () => {
			const dir = makeTmp()
			const s = new Session(join(dir, 'session.json'))
			s.save('first@yaro.page')
			s.save('second@yaro.page')
			assert.equal(s.load(), 'second@yaro.page')
		})
	})

	describe('load()', () => {
		it('returns null when no file exists', () => {
			const dir = makeTmp()
			const s = new Session(join(dir, 'nope.json'))
			assert.equal(s.load(), null)
		})

		it('returns null on corrupt file', () => {
			const dir = makeTmp()
			const filepath = join(dir, 'bad.json')
			writeFileSync(filepath, '{{{invalid json', 'utf-8')
			const s = new Session(filepath)
			assert.equal(s.load(), null)
		})

		it('returns null on empty object', () => {
			const dir = makeTmp()
			const filepath = join(dir, 'empty.json')
			writeFileSync(filepath, '{}', 'utf-8')
			const s = new Session(filepath)
			assert.equal(s.load(), null)
		})
	})

	describe('clear()', () => {
		it('clears saved session', () => {
			const dir = makeTmp()
			const s = new Session(join(dir, 'session.json'))
			s.save('test@yaro.page')
			s.clear()
			assert.equal(s.load(), null)
		})

		it('no-op when no file exists', () => {
			const dir = makeTmp()
			const s = new Session(join(dir, 'nope.json'))
			s.clear() // should not throw
		})
	})

	describe('auto-create dirs', () => {
		it('creates parent dirs on save', () => {
			const dir = makeTmp()
			const s = new Session(join(dir, 'deep', 'nested', 'session.json'))
			s.save('test@yaro.page')
			assert.equal(s.load(), 'test@yaro.page')
		})
	})
})
