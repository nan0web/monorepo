#!/usr/bin/env node

/**
 * share.js — Sovereign Media Pipeline CLI Tool
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { VideoCompiler } from '../src/domain/VideoCompiler.js'
import { ShortsGenerator } from '../src/domain/ShortsGenerator.js'
import { TrendAnalyzer } from '../src/domain/TrendAnalyzer.js'
import { evaluateRules, executeTasks } from '../src/domain/RulesEngine.js'

const [,, command, ...args] = process.argv

const HELP_TEXT = `
  Sovereign Media Pipeline CLI (share.app)
  
  Usage:
    share compile <sourceType> <episodeDir>   Compile vlog collage (sourceType: audio|video|text)
    share shorts <shortsYaml>                  Slice vertical Shorts from vlog config
    share publish <content> <rules>           Evaluate scheduling rules and distribute
    share trends                              Analyze search/video trends and print digest
`

function logHeader(title) {
	console.log('\x1b[36m%s\x1b[0m', `=== ${title} ===`)
}

function logSuccess(message) {
	console.log('\x1b[32m%s\x1b[0m', `✔ ${message}`)
}

function logError(message) {
	console.log('\x1b[31m%s\x1b[0m', `✖ Error: ${message}`)
}

async function main() {
	if (!command || ['--help', '-h', 'help'].includes(command)) {
		console.log(HELP_TEXT)
		process.exit(0)
	}

	try {
		switch (command) {
			case 'compile': {
				const [sourceType, episodeDir] = args
				if (!sourceType || !episodeDir) {
					throw new Error('Usage: share compile <sourceType> <episodeDir>')
				}
				logHeader(`Compiling Media (${sourceType})`)
				const compiler = new VideoCompiler(episodeDir)
				const res = await compiler.compile(sourceType)
				if (res.ok) {
					logSuccess(`Collage compiled successfully: ${res.outputPath}`)
				} else {
					throw new Error('Compilation failed')
				}
				break
			}

			case 'shorts': {
				const [shortsYaml] = args
				if (!shortsYaml) {
					throw new Error('Usage: share shorts <shortsYaml>')
				}
				logHeader('Slicing Shorts')
				const generator = new ShortsGenerator()
				const res = await generator.split(shortsYaml)
				if (res.ok) {
					logSuccess(`Shorts sliced successfully. Generated ${res.count} items.`)
				} else {
					throw new Error('Shorts slicing failed')
				}
				break
			}

			case 'publish': {
				const [contentPath, rulesPath] = args
				if (!contentPath || !rulesPath) {
					throw new Error('Usage: share publish <contentPath> <rulesPath>')
				}
				logHeader('Evaluating Rules & Publishing')
				
				// Mock content/rules loading
				const content = {
					title: 'День Конституції України',
					text: 'Аналітичний розбір законів та суверенітету.',
					tags: ['Конституція', 'Суверенітет'],
					video: '/media/season_1/episode_2/shorts/short1.mp4'
				}
				const rules = [
					{
						conditions: { type: 'video' },
						target: { adapter: 'youtube', clientId: '123', clientSecret: 'abc', refreshToken: 'xyz' }
					}
				]

				const tasks = evaluateRules(content, rules)
				const results = await executeTasks(tasks)
				logSuccess(`Published ${results.length} tasks successfully.`)
				break
			}

			case 'trends': {
				logHeader('Analyzing Trends')
				const analyzer = new TrendAnalyzer()
				const res = await analyzer.compileDigest()
				if (res.ok) {
					console.log(JSON.stringify(res, null, 2))
					logSuccess('Trends compiled.')
				} else {
					throw new Error('Failed to analyze trends')
				}
				break
			}

			default:
				logError(`Unknown command: ${command}`)
				console.log(HELP_TEXT)
				process.exit(1)
		}
	} catch (err) {
		logError(err.message)
		process.exit(1)
	}
}

main()
