import { describe, it } from 'node:test'
import assert from 'node:assert'
import * as Module from '../../../../../index.js'
import * as Domain from '../../../../../domain/index.js'

describe('CO-5 Minor Release: Verse Domain Architecture & Media Hybrid System', () => {
    describe('Module & Domain check', () => {
        it('should correctly expose all core and domain classes', () => {
            assert.ok(Module.App, 'App should be exported')
            assert.ok(Module.Chat, 'Chat should be exported')
            assert.ok(Module.Message, 'Message should be exported')
            assert.ok(Module.InputMessage, 'InputMessage should be exported')
            assert.ok(Module.OutputMessage, 'OutputMessage should be exported')
            assert.ok(Module.I18nMessage, 'I18nMessage should be exported')
            assert.ok(Module.Media, 'Media should be exported')
            assert.ok(Module.Post, 'Post should be exported')
            assert.ok(Module.Identity, 'Identity should be exported')
            assert.ok(Module.Connection, 'Connection should be exported')
            assert.ok(Module.Interaction, 'Interaction should be exported')
            assert.ok(Module.Service, 'Service should be exported')
            assert.ok(Module.Event, 'Event should be exported')

            assert.equal(Domain.Media, Module.Media)
            assert.equal(Domain.Post, Module.Post)
            assert.equal(Domain.Identity, Module.Identity)
            assert.equal(Domain.Message, Module.Message)
        })
    })
})
