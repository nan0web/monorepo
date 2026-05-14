import { describe, it, expect } from 'vitest'
import AppView from './AppView.js'
import Frame from '../../src/Frame/Frame.js'

describe('AppView', () => {
	it('should create an instance', () => {
		const view = new AppView()
		expect(view).toBeInstanceOf(AppView)
	})
	it('should render a welcome component', () => {
		const view = new AppView()
		const welcome = view.render('Welcome')({ user: { name: 'NaN•' } })
		expect(welcome).toBeInstanceOf(Frame)
		expect(view.stdout.stream).toEqual([
			['Welcome NaN•!', 'What can we do today great?', ''].join('\n'),
		])
	})
})
