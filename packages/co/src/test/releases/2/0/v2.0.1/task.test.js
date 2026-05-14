import { describe, it } from 'node:test'
import assert from 'node:assert'
import * as Module from '../../../../../index.js'

describe('CO-4 Patch Release: Code Hygiene & Module Graph Stabilization', () => {
    describe('Module check', () => {
        it('should correctly expose all core classes', () => {
            assert.ok(Module.App, 'App should be exported')
            assert.ok(Module.Chat, 'Chat should be exported')
            assert.ok(Module.Message, 'Message should be exported')
            assert.ok(Module.InputMessage, 'InputMessage should be exported')
            assert.ok(Module.OutputMessage, 'OutputMessage should be exported')
            assert.ok(Module.I18nMessage, 'I18nMessage should be exported')
            assert.equal(Module.StackDetector, undefined, 'StackDetector MUST NOT be exported due to circular dependencies violation')
        })
    })
})
