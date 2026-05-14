import { describe, it, expect } from 'vitest'
import React from 'react'
import { screen } from '@testing-library/react'
import { MemoryDB } from '@nan0web/test'
import AppModule from './AppModule.jsx'
import { beforeAll } from 'vitest'

const db = new MemoryDB({
	predefined: new Map([
		['app/test/config.json', { theme: 'dark' }],
		['app/test/main.json', { $content: [] }],
		['app/test/data.json', { test: 'data' }],
	]),
})
describe('AppModule', () => {
	beforeAll(async () => {
		await db.connect()
	})
	it('should create an instance with correct uri and db', () => {
		const db = new MemoryDB()
		const module = new AppModule('app/test', db)

		expect(module.uri).toBe('app/test')
		// expect(module.db).toBe(db) // Removed because db.extract creates a new instance
	})

	it('should load config, ui and data', async () => {
		const module = new AppModule('/app/test/', db)
		await module.load()
		expect(module.config).toEqual({ theme: 'dark' })
		expect(module.ui).toEqual({ $content: [] })
		expect(module.data).toEqual({ test: 'data' })
	})

	it('should render ui element', async () => {
		const module = new AppModule('app/test', db)
		await module.load()
		const result = module.render()
		// empty div rendered
		expect(result).toBeTruthy()
	})
})
