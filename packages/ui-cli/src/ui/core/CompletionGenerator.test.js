import { describe, it } from 'node:test'
import assert from 'node:assert'
import CompletionGenerator from './CompletionGenerator.js'

// Mock App class for testing
class TestApp {
	static target = {
		type: 'string',
		help: 'Target path or URL',
		default: undefined,
	}

	static debug = {
		type: 'boolean',
		help: 'Enable debug output',
		default: false,
		alias: 'd',
	}

	static help = {
		type: 'boolean',
		help: 'Show help text',
		default: false,
	}
}

describe('CompletionGenerator', () => {
	describe('extractCommandStructure', () => {
		it('should extract command structure from Model class', () => {
			const structure = CompletionGenerator.extractCommandStructure(TestApp)
			
			assert.ok(structure.Messages)
			assert.ok(structure.options)
			assert.ok(structure.options.target)
			assert.ok(structure.options.debug)
			assert.ok(structure.options.help)
		})
	})

	describe('getAllOptions', () => {
		it('should extract all options with long and short forms', () => {
			const structure = CompletionGenerator.extractCommandStructure(TestApp)
			const options = CompletionGenerator.getAllOptions(structure)
			
			assert.ok(Array.isArray(options))
			assert.ok(options.length > 0)
			
			const targetOption = options.find(opt => opt.long === 'target')
			assert.ok(targetOption)
			assert.equal(targetOption.long, 'target')
			
			const debugOption = options.find(opt => opt.long === 'debug')
			assert.ok(debugOption)
			assert.equal(debugOption.long, 'debug')
			assert.equal(debugOption.short, 'd')
		})
	})

	describe('getAllCommands', () => {
		it('should extract commands from structure', () => {
			const structure = CompletionGenerator.extractCommandStructure(TestApp)
			const commands = CompletionGenerator.getAllCommands(structure)
			
			assert.ok(Array.isArray(commands))
			// Should have at least the TestApp class as a command
			assert.ok(commands.length >= 1)
		})
	})

	describe('generateZshCompletion', () => {
		it('should generate valid zsh completion script', () => {
			const structure = CompletionGenerator.extractCommandStructure(TestApp)
			const zshScript = CompletionGenerator.generateZshCompletion(structure, 'testapp')
			
			assert.ok(zshScript)
			assert.ok(typeof zshScript === 'string')
			assert.ok(zshScript.length > 0)
			assert.ok(zshScript.includes('#compdef testapp'))
			assert.ok(zshScript.includes('_testapp()'))
			assert.ok(zshScript.includes('compdef'))
		})
	})

	describe('generateBashCompletion', () => {
		it('should generate valid bash completion script', () => {
			const structure = CompletionGenerator.extractCommandStructure(TestApp)
			const bashScript = CompletionGenerator.generateBashCompletion(structure, 'testapp')
			
			assert.ok(bashScript)
			assert.ok(typeof bashScript === 'string')
			assert.ok(bashScript.length > 0)
			assert.ok(bashScript.includes('# testapp bash completion'))
			assert.ok(bashScript.includes('_testapp()'))
			assert.ok(bashScript.includes('complete -F'))
		})
	})

	describe('generateCompletionScript', () => {
		it('should generate zsh completion script', () => {
			const structure = CompletionGenerator.extractCommandStructure(TestApp)
			const script = CompletionGenerator.generateCompletionScript('zsh', structure, 'testapp')
			
			assert.ok(script)
			assert.ok(script.includes('#compdef testapp'))
		})

		it('should generate bash completion script', () => {
			const structure = CompletionGenerator.extractCommandStructure(TestApp)
			const script = CompletionGenerator.generateCompletionScript('bash', structure, 'testapp')
			
			assert.ok(script)
			assert.ok(script.includes('# testapp bash completion'))
		})

		it('should throw error for invalid shell type', () => {
			const structure = CompletionGenerator.extractCommandStructure(TestApp)
			
			assert.throws(() => {
				CompletionGenerator.generateCompletionScript('invalid', structure, 'testapp')
			}, /Unsupported shell type/)
		})
	})
})