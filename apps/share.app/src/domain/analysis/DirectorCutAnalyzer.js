/**
 * @file DirectorCutAnalyzer.js
 * Parses director speech triggers (Camera <SceneName> / Camera Start / Camera Stop)
 * and generates clean scene cut intervals with safe acoustic padding.
 */

import { Model } from '@nan0web/types'

export class DirectorCutAnalyzer extends Model {
	static alias = 'director-cut-analyzer'

	static sceneAliases = {
		type: 'object',
		default: {
			'код': 'code',
			'чат': 'chat',
			'старт': 'start',
			'екран': 'screen',
			'презентація': 'presentation',
			'ліво': 'left',
			'ліва': 'left',
			'left': 'left',
			'право': 'right',
			'права': 'right',
			'right': 'right',
			'центр': 'center',
			'center': 'center',
		},
		help: 'Declarative scene mapping from localized spoken triggers to normalized English scene keys',
	}

	static scenes = {
		type: 'object',
		default: {},
		help: 'Custom configuration per scene key (e.g. { code: { box: "960x1080+0+0", align: "left" } })',
	}

	static cutSilence = {
		type: 'boolean',
		default: false,
		help: 'Whether to trim silence gaps to speech boundaries',
	}

	static minSilenceDuration = {
		type: 'number',
		default: 2.0,
		help: 'Minimum silence gap duration (seconds) required before trimming silence',
	}

	static paddingBefore = {
		type: 'number',
		default: 0.5,
		help: 'Seconds before content start when trimming',
	}

	static paddingAfter = {
		type: 'number',
		default: 1.0,
		help: 'Seconds after content end when trimming',
	}

	static totalDuration = {
		type: 'number',
		help: 'Total duration of the media file in seconds',
	}

	/**
	 * @param {object} [data]
	 * @param {object} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {Record<string, string>} Scene aliases map */
		this.sceneAliases = {
			...DirectorCutAnalyzer.sceneAliases.default,
			...(data.sceneAliases || options.sceneAliases || {}),
		}
		/** @type {Record<string, any>} */
		this.scenes = data.scenes || options.scenes || {}
		/** @type {boolean} */
		this.cutSilence = data.cutSilence ?? options.cutSilence ?? false
		/** @type {number} */
		this.minSilenceDuration = data.minSilenceDuration ?? options.minSilenceDuration ?? 2.0
		/** @type {number} */
		this.paddingBefore = data.paddingBefore ?? options.paddingBefore ?? 0.5
		/** @type {number} */
		this.paddingAfter = data.paddingAfter ?? options.paddingAfter ?? 1.0
		/** @type {number|undefined} */
		this.totalDuration = data.totalDuration ?? options.totalDuration
	}

	/**
	 * Parse Whisper transcript into director scenes.
	 * @param {object} transcript - Whisper transcript with segments and optional words.
	 * @returns {Array<{ sceneName: string, start: number, end: number, text: string, align?: string, box?: string }>}
	 */
	parseScenes(transcript) {
		const segments = transcript?.segments || []
		if (segments.length === 0) return []

		const scenes = []
		let currentScene = null

		for (let i = 0; i < segments.length; i++) {
			const seg = segments[i]
			const text = (seg.text || '').trim()

			// Check for Camera Stop (English and Ukrainian)
			const stopMatch = text.match(/(?:^|[\s.,!?;])(camera|камера)[,\s]+(stop|стоп)(?:$|[\s.,!?;])/i)
			if (stopMatch && currentScene) {
				const stopMarkerStart = seg.words?.find(w => /(camera|камера)/i.test(w.word))?.start ?? seg.start
				if (this.cutSilence) {
					const rawEnd = (currentScene.contentEnd ?? currentScene.start) + this.paddingAfter
					currentScene.end = Number(Math.min(rawEnd, stopMarkerStart).toFixed(2))
				} else {
					currentScene.end = Number(stopMarkerStart.toFixed(2))
				}
				scenes.push(currentScene)
				currentScene = null
				continue
			}

			// Check for Camera <SceneName> or Camera Start (English and Ukrainian)
			const startMatch = text.match(/(?:^|[\s.,!?;])(?:camera|камера)[,\s]+([a-zа-яіїєґ0-9_-]+)/i)
			if (startMatch) {
				let rawScene = startMatch[1].toLowerCase()
				const sceneKey = this.sceneAliases[rawScene] || rawScene
				const cameraWord = seg.words?.find(w => /(camera|камера)/i.test(w.word))
				const markerWord = seg.words?.find(w => new RegExp(rawScene, 'i').test(w.word))
				const markerStart = cameraWord?.start ?? seg.start
				const markerEnd = markerWord?.end ?? seg.end

				if (currentScene) {
					// Seamless switch: close previous scene bounded before current Camera command
					if (this.cutSilence) {
						const rawEnd = (currentScene.contentEnd ?? currentScene.start) + this.paddingAfter
						currentScene.end = Number(Math.min(rawEnd, markerStart).toFixed(2))
					} else {
						currentScene.end = Number(markerStart.toFixed(2))
					}
					scenes.push(currentScene)
				}

				const customConfig = this.scenes[rawScene] || this.scenes[sceneKey] || {}
				const sceneName = sceneKey.charAt(0).toUpperCase() + sceneKey.slice(1)
				let align = customConfig.align
				if (!align && ['left', 'right', 'center'].includes(sceneKey)) {
					align = sceneKey
				}

				currentScene = {
					sceneName,
					markerEnd,
					start: Number(markerEnd.toFixed(2)),
					end: Number(markerEnd.toFixed(2)),
					text: '',
					contentEnd: null
				}
				if (align) currentScene.align = align
				if (customConfig.offsetX !== undefined) currentScene.offsetX = customConfig.offsetX
				if (customConfig.box) currentScene.box = customConfig.box
				continue
			}

			// Regular content segment
			if (currentScene) {
				if (this.cutSilence && currentScene.text === '') {
					const contentStart = Math.max(
						currentScene.markerEnd,
						Number((seg.start - this.paddingBefore).toFixed(2))
					)
					currentScene.start = contentStart
				}
				currentScene.contentEnd = seg.end
				currentScene.text = (currentScene.text ? currentScene.text + ' ' : '') + text
			}
		}

		if (currentScene) {
			if (this.cutSilence) {
				currentScene.end = Number(((currentScene.contentEnd ?? currentScene.start) + this.paddingAfter).toFixed(2))
			} else {
				const fallbackEnd = this.totalDuration ?? segments[segments.length - 1]?.end ?? currentScene.start
				currentScene.end = Number(fallbackEnd.toFixed(2))
			}
			if (currentScene.end > currentScene.start || currentScene.text.trim().length > 0) {
				scenes.push(currentScene)
			}
		}

		return scenes.filter(s => (s.end - s.start) > 0.5 || s.text.trim().length > 0)
	}
}


