import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'
import { createT } from './TFunction.js'

describe('createT', () => {
	it('should support basic substitution', () => {
		const t = createT({ 'Hello {name}': 'Привіт, {name}!' }, 'uk-UA')
		assert.equal(t('Hello {name}', { name: 'Іван' }), 'Привіт, Іван!')
		assert.equal(t('Missing key {x}', { x: 1 }), 'Missing key 1')
	})

	describe('Plural rules', () => {
		it('should process $count plurals (uk)', () => {
			const t = createT(
				{
					apple_one: '{count} яблуко',
					apple_few: '{count} яблука',
					apple_many: '{count} яблук',
					apple_other: '{count} яблука',
					apple: 'яблуко',
				},
				'uk-UA',
			)

			assert.equal(t('apple', { $count: 1, count: 1 }), '1 яблуко')
			assert.equal(t('apple', { $count: 2, count: 2 }), '2 яблука')
			assert.equal(t('apple', { $count: 5, count: 5 }), '5 яблук')
		})

		it('should support numeric variables as shorthand for recursive pluralization', () => {
			const t = createT(
				{
					apples_one: '{count} яблуко',
					apples_few: '{count} яблука',
					apples_many: '{count} яблук',
					apricots_one: '{count} абрикос',
					apricots_few: '{count} абрикоси',
					apricots_many: '{count} абрикосів',
					'I have {apples} and {apricots}': 'У мене є {apples} і {apricots}',
				},
				'uk-UA',
			)
			// apples: 1 => t('apples', { $count: 1, count: 1 })
			assert.equal(
				t('I have {apples} and {apricots}', { apples: 1, apricots: 1 }),
				'У мене є 1 яблуко і 1 абрикос',
			)
			assert.equal(
				t('I have {apples} and {apricots}', { apples: 2, apricots: 2 }),
				'У мене є 2 яблука і 2 абрикоси',
			)
			assert.equal(
				t('I have {apples} and {apricots}', { apples: 3, apricots: 5 }),
				'У мене є 3 яблука і 5 абрикосів',
			)
		})
	})

	it('should support $ordinal rules (en)', () => {
		const t = createT(
			{
				day_one: '{day}st day',
				day_two: '{day}nd day',
				day_few: '{day}rd day',
				day_other: '{day}th day',
				day: 'day',
			},
			'en-US',
		)

		assert.equal(t('day', { $ordinal: 1, day: 1 }), '1st day')
		assert.equal(t('day', { $ordinal: 2, day: 2 }), '2nd day')
		assert.equal(t('day', { $ordinal: 3, day: 3 }), '3rd day')
		assert.equal(t('day', { $ordinal: 4, day: 4 }), '4th day')
	})
})
