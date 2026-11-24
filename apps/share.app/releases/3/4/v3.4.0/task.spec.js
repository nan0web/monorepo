import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { DirectorCutAnalyzer } from '../../../../src/domain/analysis/DirectorCutAnalyzer.js'

describe('Release v3.4.0 Contract: Director\'s Cut Voice Triggers & Scene Slicing', () => {
	const sampleTranscript = {
		segments: [
			{
				id: 0,
				start: 1.0,
				end: 2.2,
				text: ' Camera Chat. ',
				words: [
					{ word: 'Camera', start: 1.0, end: 1.5 },
					{ word: 'Chat', start: 1.6, end: 2.2 }
				]
			},
			{
				id: 1,
				start: 2.8,
				end: 6.0,
				text: ' Привіт усім! Сьогодні розбираємо архітектуру Вісника. ',
				words: [
					{ word: 'Привіт', start: 2.8, end: 3.2 },
					{ word: 'усім!', start: 3.3, end: 3.8 },
					{ word: 'Сьогодні', start: 4.0, end: 4.5 },
					{ word: 'розбираємо', start: 4.6, end: 5.2 },
					{ word: 'архітектуру', start: 5.3, end: 5.7 },
					{ word: 'Вісника.', start: 5.8, end: 6.0 }
				]
			},
			{
				id: 2,
				start: 6.5,
				end: 7.8,
				text: ' Camera Stop. ',
				words: [
					{ word: 'Camera', start: 6.5, end: 7.0 },
					{ word: 'Stop', start: 7.1, end: 7.8 }
				]
			},
			{
				id: 3,
				start: 10.0,
				end: 11.2,
				text: ' Camera Code. ',
				words: [
					{ word: 'Camera', start: 10.0, end: 10.5 },
					{ word: 'Code', start: 10.6, end: 11.2 }
				]
			},
			{
				id: 4,
				start: 11.8,
				end: 15.0,
				text: ' Дивіться на контрактні тести у task.spec.js. ',
				words: [
					{ word: 'Дивіться', start: 11.8, end: 12.3 },
					{ word: 'на', start: 12.4, end: 12.6 },
					{ word: 'контрактні', start: 12.7, end: 13.3 },
					{ word: 'тести', start: 13.4, end: 13.8 },
					{ word: 'у', start: 13.9, end: 14.1 },
					{ word: 'task.spec.js.', start: 14.2, end: 15.0 }
				]
			},
			{
				id: 5,
				start: 15.5,
				end: 16.8,
				text: ' Camera Stop. ',
				words: [
					{ word: 'Camera', start: 15.5, end: 16.0 },
					{ word: 'Stop', start: 16.1, end: 16.8 }
				]
			}
		]
	}

	it('should instantiate DirectorCutAnalyzer with default settings', () => {
		const analyzer = new DirectorCutAnalyzer()
		assert.equal(typeof analyzer.parseScenes, 'function')
		assert.equal(analyzer.paddingBefore, 0.5)
		assert.equal(analyzer.paddingAfter, 1.0)
	})

	it('should detect Camera <Scene> and Camera Stop markers correctly', () => {
		const analyzer = new DirectorCutAnalyzer({ paddingBefore: 0.5, paddingAfter: 0.8 })
		const scenes = analyzer.parseScenes(sampleTranscript)

		assert.equal(scenes.length, 2, 'Should identify exactly two scenes')

		// Scene 1: Chat
		const scene1 = scenes[0]
		assert.equal(scene1.sceneName, 'Chat')
		// Content starts around 2.8s (content start - paddingBefore = 2.3s)
		assert.ok(scene1.start >= 2.2 && scene1.start <= 2.4, `Scene 1 start should be ~2.3s, got ${scene1.start}`)
		// Content ends around 6.0s (content end + paddingAfter = 6.8s, but capped before Camera Stop at 6.5s)
		assert.ok(scene1.end <= 6.5, `Scene 1 end must be before Camera Stop (6.5s), got ${scene1.end}`)
		assert.ok(scene1.text.includes('Привіт усім!'))
		assert.equal(scene1.text.includes('Camera'), false, 'Should strip Camera commands from scene text')

		// Scene 2: Code
		const scene2 = scenes[1]
		assert.equal(scene2.sceneName, 'Code')
		assert.ok(scene2.start >= 11.2 && scene2.start <= 11.4, `Scene 2 start should be ~11.3s, got ${scene2.start}`)
		assert.ok(scene2.end <= 15.5, `Scene 2 end must be before Camera Stop (15.5s), got ${scene2.end}`)
		assert.ok(scene2.text.includes('Дивіться на контрактні тести'))
		assert.equal(scene2.text.includes('Camera'), false, 'Should strip Camera commands from scene text')
	})

	it('should support "Camera Start" as default general scene marker', () => {
		const analyzer = new DirectorCutAnalyzer()
		const transcriptWithStart = {
			segments: [
				{
					id: 0,
					start: 0.5,
					end: 1.8,
					text: ' Camera Start. ',
					words: [
						{ word: 'Camera', start: 0.5, end: 1.0 },
						{ word: 'Start', start: 1.1, end: 1.8 }
					]
				},
				{
					id: 1,
					start: 2.2,
					end: 5.0,
					text: ' Загальний план виступу. ',
					words: [
						{ word: 'Загальний', start: 2.2, end: 3.0 },
						{ word: 'план', start: 3.1, end: 3.7 },
						{ word: 'виступу.', start: 3.8, end: 5.0 }
					]
				},
				{
					id: 2,
					start: 5.5,
					end: 6.8,
					text: ' Camera Stop. ',
					words: [
						{ word: 'Camera', start: 5.5, end: 6.0 },
						{ word: 'Stop', start: 6.1, end: 6.8 }
					]
				}
			]
		}
		const scenes = analyzer.parseScenes(transcriptWithStart)
		assert.equal(scenes.length, 1)
		assert.equal(scenes[0].sceneName, 'Start')
		assert.ok(scenes[0].text.includes('Загальний план виступу.'))
	})

	it('should support switching directly between scenes without Camera Stop (Camera Chat -> Camera Code)', () => {
		const analyzer = new DirectorCutAnalyzer({ paddingBefore: 0.5, paddingAfter: 1.0 })
		const seamlessTranscript = {
			segments: [
				{
					id: 0,
					start: 1.0,
					end: 2.2,
					text: ' Camera Chat. ',
					words: [
						{ word: 'Camera', start: 1.0, end: 1.5 },
						{ word: 'Chat', start: 1.6, end: 2.2 }
					]
				},
				{
					id: 1,
					start: 2.8,
					end: 6.0,
					text: ' Перша сцена чату без стопу. ',
					words: [
						{ word: 'Перша', start: 2.8, end: 3.5 },
						{ word: 'сцена', start: 3.6, end: 4.2 },
						{ word: 'чату.', start: 4.3, end: 6.0 }
					]
				},
				{
					id: 2,
					start: 6.5,
					end: 7.8,
					text: ' Camera Code. ',
					words: [
						{ word: 'Camera', start: 6.5, end: 7.0 },
						{ word: 'Code', start: 7.1, end: 7.8 }
					]
				},
				{
					id: 3,
					start: 8.2,
					end: 11.0,
					text: ' Друга сцена коду пішла одразу. ',
					words: [
						{ word: 'Друга', start: 8.2, end: 9.0 },
						{ word: 'сцена', start: 9.1, end: 9.8 },
						{ word: 'коду.', start: 9.9, end: 11.0 }
					]
				},
				{
					id: 4,
					start: 11.5,
					end: 12.8,
					text: ' Camera Stop. ',
					words: [
						{ word: 'Camera', start: 11.5, end: 12.0 },
						{ word: 'Stop', start: 12.1, end: 12.8 }
					]
				}
			]
		}

		const scenes = analyzer.parseScenes(seamlessTranscript)
		assert.equal(scenes.length, 2, 'Should switch scenes directly')
		assert.equal(scenes[0].sceneName, 'Chat')
		assert.ok(scenes[0].end <= 6.5, 'Scene 1 end must be cut before Camera Code marker (6.5s)')
		assert.equal(scenes[1].sceneName, 'Code')
		assert.ok(scenes[1].end <= 11.5, 'Scene 2 end must be cut before Camera Stop (11.5s)')
	})

	it('should keep visual silence by default (cutSilence: false) starting immediately at markerEnd', () => {
		const transcriptWithSilence = {
			segments: [
				{
					id: 0,
					start: 2.0,
					end: 4.0,
					text: ' Камера код. ',
					words: [
						{ word: 'Камера', start: 2.0, end: 3.0 },
						{ word: 'код.', start: 3.0, end: 4.0 }
					]
				},
				{
					id: 1,
					start: 10.0,
					end: 15.0,
					text: ' Мова почалася після 6 секунд мовчання. ',
					words: [
						{ word: 'Мова', start: 10.0, end: 11.0 },
						{ word: 'почалася', start: 11.1, end: 15.0 }
					]
				},
				{
					id: 2,
					start: 25.0,
					end: 27.0,
					text: ' Камера стоп. ',
					words: [
						{ word: 'Камера', start: 25.0, end: 26.0 },
						{ word: 'стоп.', start: 26.0, end: 27.0 }
					]
				}
			]
		}

		// When cutSilence: false (default), scene start should be exactly markerEnd (4.0s) and end at markerStart (25.0s)
		const analyzerPreserve = new DirectorCutAnalyzer({ cutSilence: false })
		const scenesPreserve = analyzerPreserve.parseScenes(transcriptWithSilence)
		assert.equal(scenesPreserve.length, 1)
		assert.equal(scenesPreserve[0].start, 4.0, 'Start must begin immediately after camera command')
		assert.equal(scenesPreserve[0].end, 25.0, 'End must extend until the stop command without cutting silence')

		// When cutSilence: true, it should trim silence to speech boundaries with padding
		const analyzerTrim = new DirectorCutAnalyzer({ cutSilence: true, paddingBefore: 0.5, paddingAfter: 1.0 })
		const scenesTrim = analyzerTrim.parseScenes(transcriptWithSilence)
		assert.equal(scenesTrim.length, 1)
		assert.equal(scenesTrim[0].start, 9.5, 'Start should be trimmed to speech start - paddingBefore (10.0 - 0.5 = 9.5s)')
		assert.equal(scenesTrim[0].end, 16.0, 'End should be trimmed to speech end + paddingAfter (15.0 + 1.0 = 16.0s)')
	})

	it('should support natural directional triggers: Camera Left, Camera Right, Camera Center', () => {
		const transcript = {
			segments: [
				{
					id: 0,
					start: 1.0,
					end: 2.5,
					text: ' Камера ліво. ',
					words: [
						{ word: 'Камера', start: 1.0, end: 1.6 },
						{ word: 'ліво.', start: 1.7, end: 2.5 }
					]
				},
				{
					id: 1,
					start: 3.0,
					end: 6.0,
					text: ' Дивимося на ліву частину. ',
					words: [
						{ word: 'Дивимося', start: 3.0, end: 4.0 },
						{ word: 'на', start: 4.1, end: 4.5 },
						{ word: 'ліву', start: 4.6, end: 5.0 },
						{ word: 'частину.', start: 5.1, end: 6.0 }
					]
				},
				{
					id: 2,
					start: 6.5,
					end: 8.0,
					text: ' Camera Right. ',
					words: [
						{ word: 'Camera', start: 6.5, end: 7.0 },
						{ word: 'Right.', start: 7.1, end: 8.0 }
					]
				},
				{
					id: 3,
					start: 8.5,
					end: 11.0,
					text: ' Дивимося на праву частину. ',
					words: [
						{ word: 'Дивимося', start: 8.5, end: 9.5 },
						{ word: 'на', start: 9.6, end: 9.8 },
						{ word: 'праву', start: 9.9, end: 10.3 },
						{ word: 'частину.', start: 10.4, end: 11.0 }
					]
				},
				{
					id: 4,
					start: 11.5,
					end: 13.0,
					text: ' Камера стоп. ',
					words: [
						{ word: 'Камера', start: 11.5, end: 12.0 },
						{ word: 'стоп.', start: 12.1, end: 13.0 }
					]
				}
			]
		}

		const analyzer = new DirectorCutAnalyzer()
		const scenes = analyzer.parseScenes(transcript)
		assert.equal(scenes.length, 2)
		assert.equal(scenes[0].sceneName, 'Left')
		assert.equal(scenes[0].align, 'left')
		assert.equal(scenes[1].sceneName, 'Right')
		assert.equal(scenes[1].align, 'right')
	})

	it('should support custom scene bounding boxes via options.scenes (W:H:X:Y, percentages and px)', () => {
		const transcript = {
			segments: [
				{
					id: 0,
					start: 1.0,
					end: 2.5,
					text: ' Камера код. ',
					words: [
						{ word: 'Камера', start: 1.0, end: 1.6 },
						{ word: 'код.', start: 1.7, end: 2.5 }
					]
				},
				{
					id: 1,
					start: 3.0,
					end: 6.0,
					text: ' Працюємо з кодом. ',
					words: [
						{ word: 'Працюємо', start: 3.0, end: 4.0 },
						{ word: 'з', start: 4.1, end: 4.3 },
						{ word: 'кодом.', start: 4.4, end: 6.0 }
					]
				},
				{
					id: 2,
					start: 6.5,
					end: 7.8,
					text: ' Camera Stop. ',
					words: [
						{ word: 'Camera', start: 6.5, end: 7.0 },
						{ word: 'Stop.', start: 7.1, end: 7.8 }
					]
				}
			]
		}

		// Configure custom bounding box for "code"
		const analyzer = new DirectorCutAnalyzer({
			scenes: {
				code: { box: '960x1080+0+0', align: 'left' }
			}
		})
		const scenes = analyzer.parseScenes(transcript)
		assert.equal(scenes.length, 1)
		assert.equal(scenes[0].sceneName, 'Code')
		assert.equal(scenes[0].box, '960x1080+0+0')
		assert.equal(scenes[0].align, 'left')
	})
})
