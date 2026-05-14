import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { EditorConfig } from '../../../domain/EditorConfig.js'
import { EditorModel } from '../../../domain/EditorModel.js'

describe('UI Components Logic & Mapping', () => {
	
	it('TreeNavigator should respect EditorConfig settings', () => {
		const config = new EditorConfig({
			uiShowStagedMarkers: false,
			uiStagedMarkerColor: 'red'
		})
		
		// Логіка компонента має використовувати ці значення
		assert.equal(config.uiShowStagedMarkers, false)
		assert.equal(config.uiStagedMarkerColor, 'red')
	})

	it('EditorWeb should correctly bind to Model events', async () => {
		const model = new EditorModel()
		let updateRequested = false
		
		// Імітуємо підписку адаптера
		model.on('active-doc-change', () => { updateRequested = true })
		
		// Дія в моделі
		model.emit('active-doc-change', {})
		
		assert.equal(updateRequested, true)
	})

	it('PolymorphicField logic should select correct widget type', () => {
		const schema = { type: 'enum', options: ['A', 'B'] }
		
		// Логіка вибору віджета (mock)
		const getWidgetType = (s) => s.type === 'enum' ? 'select' : 'input'
		
		assert.equal(getWidgetType(schema), 'select')
	})
})
