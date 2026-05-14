import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import { Model } from '@nan0web/core'

import { InputModel } from '../../../../../domain/components/InputModel.js'
import { AutocompleteModel } from '../../../../../domain/components/AutocompleteModel.js'

describe('Release v1.7.1: UI Models Migration', () => {
    test('InputModel extends Model correctly', () => {
        const input = new InputModel({ 
            placeholder: 'enter text', 
            label: 'Name', 
            required: true 
        })
        
        // Перевіряємо, що модель успадкувала базовий клас
        assert.ok(input instanceof Model, 'InputModel must extend @nan0web/core Model')
        
        // Перевіряємо ініціалізацію властивостей і роботу super(data)
        assert.equal(input.placeholder, 'enter text', 'Data should be loaded into instance via Model constructor')
        assert.equal(input.required, true, 'Booleans must be resolved')
        
        // Перевіряємо що відсутні поля натягнули свої fallback defaults з static schema
        // InputModel.type має дефолт 'text'
        assert.equal(input.type, 'text', 'Default fallback mapping')
    })

    test('AutocompleteModel handles complex defaults via super() properly', () => {
        const autocomplete = new AutocompleteModel({
            content: 'some text'
        })
        
        assert.ok(autocomplete instanceof Model, 'AutocompleteModel must extend @nan0web/core Model')
        assert.equal(autocomplete.content, 'some text')
        assert.deepEqual(autocomplete.options, [], 'Arrays fallback to default empty array from static schema')
    })
})
