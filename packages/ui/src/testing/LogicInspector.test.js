import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { LogicInspector } from './LogicInspector.js'

describe('LogicInspector', () => {
    it('captures intents from a simple generator', async () => {
        async function* mockModel() {
            yield { type: 'progress', message: 'Starting' }
            const { value: name } = yield { type: 'ask', field: 'name', schema: { type: 'string', help: 'Enter your name' } }
            yield { type: 'show', level: 'info', message: `Hello ${name}` }
            yield { type: 'render', component: 'ui-button', props: { content: 'Click me' } }
            return { type: 'result', data: { ok: true } }
        }

        const intents = await LogicInspector.capture(mockModel(), { 
            inputs: ['Yaro'] 
        })

        assert.equal(intents.length, 5)
        assert.deepEqual(intents[0], { type: 'progress', message: 'Starting' })
        assert.deepEqual(intents[1], { type: 'ask', field: 'name', schema: { type: 'string', help: 'Enter your name' }, input: 'Yaro' })
        assert.deepEqual(intents[2], { type: 'show', level: 'info', message: 'Hello Yaro' })
        assert.deepEqual(intents[3], { type: 'render', component: 'ui-button', props: { content: 'Click me' } })
        assert.deepEqual(intents[4], { type: 'result', data: { ok: true } })
    })

    it('supports functional inputs for multi-language testing', async () => {
        async function* mockModel() {
            const { value: lang } = yield { type: 'ask', field: 'lang', schema: { help: '?' } }
            return { type: 'result', data: lang }
        }

        const inputs = (locale) => [locale === 'uk' ? 'UA' : 'EN']
        
        const intentsUk = await LogicInspector.capture(mockModel(), { inputs, locale: 'uk' })
        assert.equal(intentsUk.find(i => i.type === 'result').data, 'UA')

        const intentsEn = await LogicInspector.capture(mockModel(), { inputs, locale: 'en' })
        assert.equal(intentsEn.find(i => i.type === 'result').data, 'EN')
    })
})
