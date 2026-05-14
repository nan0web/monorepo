import { describe, it, expect } from 'vitest'
import { calculateNewPath } from './useHeaderNav.js'

describe('useHeaderNav - calculateNewPath pure function', () => {
	it('should add a new ID to an empty path array (user opens a dropdown)', () => {
		expect(calculateNewPath([], '0-1', 0)).toEqual(['0-1'])
	})

	it('should replace an item at the same level if the user clicks a sibling dropdown', () => {
		expect(calculateNewPath(['0-1'], '0-2', 0)).toEqual(['0-2'])
	})

	it('should preserve parent and add sub-level if the user clicks a child element', () => {
		expect(calculateNewPath(['0-1', '1-0'], '1-2', 1)).toEqual(['0-1', '1-2'])
	})

	it('should close the current ID and all its children if the user clicks it again (toggle behavior)', () => {
		expect(calculateNewPath(['0-1', '1-0', '2-3'], '1-0', 1)).toEqual(['0-1'])
	})

	it('should collapse everything below level 0 if the user clicks on a different parent at level 0', () => {
		expect(calculateNewPath(['0-1', '1-0', '2-3'], '0-2', 0)).toEqual(['0-2'])
	})
})
