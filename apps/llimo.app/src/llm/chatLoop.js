import { formatChatProgress } from "./chatProgress.js"
import { startStreaming } from "./chatSteps.js"
import { RESET, RED, YELLOW } from "../cli/ANSI.js"
import { AI } from "./AI.js"
import { Chat } from "./Chat.js"
import { Ui } from "../cli/Ui.js"
import { ModelInfo } from "./ModelInfo.js"
import { Limits, Usage } from "./Usage.js"
import { AiStrategyModel } from "../domain/AiStrategyModel.js"
import { StatsCollector } from "../utils/StatsCollector.js"
import { loadModels } from "../Chat/models.js"

function isWindowLimit(err) {
	return [err?.status, err?.statusCode].includes(400) && err?.data?.code === "context_length_exceeded"
}

/**
 * Helper – determines whether an AI error is a rate‑limit (HTTP 429)
 *
 * @param {any} err
 * @returns {boolean}
 */
function isRateLimit(err) {
	if (err?.status === 429 || err?.statusCode === 429) return true
	if (typeof err?.message === "string" && /429/.test(err.message)) return true
	return false
}

/**
 * @typedef {Object} sendAndStreamOptions
 * @property {string} answer
 * @property {string} reason
 * @property {Usage} usage
 * @property {any[]} unknowns
 * @property {any} [error]
 */

/**
 * Executes the send and stream part of the chat loop.
 * @param {Object} options
 * @param {AI} options.ai
 * @param {Chat} options.chat
 * @param {Ui} options.ui
 * @param {string} options.prompt
 * @param {number} options.step
 * @param {(n: number) => string} options.format
 * @param {(n: number) => string} options.valuta
 * @param {ModelInfo} options.model
 * @param {boolean} [options.isTiny=false] - If true, use one-line progress mode
 * @param {number} [options.fps=30]
 * @param {AiStrategyModel} [options.strategy]
 * @returns {Promise<sendAndStreamOptions>}
 */
export async function sendAndStream(options) {
	const {
		ai = new AI(),
		chat,
		ui,
		step,
		prompt,
		model: initialModel,
		fps = 30,
		isTiny = false,
		strategy = new AiStrategyModel()
	} = options

	// 1. Check budget limit using the Chat.cost() helper
	const totalSessionCost = await chat.cost()
	if (totalSessionCost >= strategy.budgetLimitUsd) {
		const budgetError = new Error(`Budget limit of $${strategy.budgetLimitUsd} exceeded (Spent: $${totalSessionCost.toFixed(4)})`)
		ui.console.error(`\nBudget limit exceeded: ${budgetError.message}`)
		return {
			answer: `Error: ${budgetError.message}`,
			reason: '',
			usage: new Usage(),
			unknowns: [],
			error: budgetError
		}
	}

	// 2. Build model priority queue
	const queue = []
	if (initialModel) {
		queue.push(initialModel)
	}
	
	// Dynamically load all available models to resolve cascade queue items
	const modelMap = await loadModels({ noCache: false })
	for (const pattern of strategy.cascadeQueue) {
		if (initialModel && (initialModel.id === pattern || `${initialModel.id}@${initialModel.provider}` === pattern)) {
			continue
		}
		const parts = pattern.split('@')
		const mId = parts[0]
		const prov = parts[1]
		let foundModel = null
		for (const mInfo of modelMap.values()) {
			if (mInfo.id === mId && (!prov || mInfo.provider === prov)) {
				foundModel = mInfo
				break
			}
		}
		if (foundModel) {
			queue.push(foundModel)
		}
	}

	if (queue.length === 0) {
		throw new Error('No models found in priority queue.')
	}

	let lastError = null
	let failoverCount = 0

	for (let qIndex = 0; qIndex < queue.length; qIndex++) {
		const currentModel = queue[qIndex]
		let attempt = 0
		const maxAttempts = strategy.retryCount + 1

		while (attempt < maxAttempts) {
			const startTime = Date.now()
			if (qIndex > 0 || attempt > 0) {
				ui.console.warn(`\n[AiStrategy] Trying: ${currentModel.id}@${currentModel.provider} (Attempt ${attempt + 1}/${maxAttempts})...`)
			}

			let prevLines = 0
			const clock = { startTime, reasonTime: 0, answerTime: 0 }
			let usage = new Usage()
			const recent = chat.steps[chat.steps.length - 1]
			if (recent) {
				usage.inputTokens += recent.usage.inputTokens
			}

			let timeoutTimer
			const timeoutPromise = new Promise((_, reject) => {
				timeoutTimer = setTimeout(() => {
					reject(new Error('TIMEOUT'))
				}, strategy.timeoutMs)
			})

			const chatting = ui.createProgress(({ elapsed }) => {
				const lines = formatChatProgress({
					ui,
					usage,
					clock,
					model: currentModel,
					isTiny
				})
				if (prevLines > 0) {
					ui.cursorUp(prevLines - 1)
					for (let i = 0; i < prevLines; i++) {
						ui.stdout.write("\x1b[K\n")
					}
					ui.cursorUp(prevLines)
				}
				for (let i = 0; i < lines.length; i++) {
					ui.write(lines[i] + (i < lines.length - 1 ? '\n' : ''))
				}
				prevLines = lines.length
			}, fps)

			try {
				const streamPromise = (async () => {
					let answer = ""
					let reason = ""
					const unknowns = []
					let timeInfo
					let error = null

					const chunks = []
					const streamOptions = {
						onChunk: (el) => {
							const chunk = el.chunk
							const words = String(chunk.text || "").split(/\s+/)
							if ("reasoning-delta" === chunk.type) {
								reason += chunk.text
								usage.reasoningTokens += words.length
								if (!clock.reasonTime) clock.reasonTime = Date.now()
							} else if ("text-delta" === chunk.type) {
								usage.outputTokens += words.length
								if (!clock.answerTime) clock.answerTime = Date.now()
							} else if ("raw" === chunk.type) {
								timeInfo = chunk.rawValue?.time_info
							} else {
								unknowns.push(["Unknown chunk.type", chunk])
							}
							chunks.push(chunk)
						},
						onError: (data) => {
							error = data.error
						},
					}

					const userStepExists = chat.messages.length > 0 &&
						chat.messages[chat.messages.length - 1].role === 'user' &&
						chat.messages[chat.messages.length - 1].content === prompt
					if (!userStepExists) {
						chat.add({ role: "user", content: prompt })
					}
					await chat.save()

					usage.inputTokens = chat.getTokensCount()

					const { stream, result } = await startStreaming(ai, currentModel, chat, streamOptions)

					await chat.append("stream", "", step)
					const parts = []
					for await (const part of stream) {
						if ("string" === typeof part || "text-delta" == part.type) {
							answer += part.text ?? part
							await chat.append("stream", part.text ?? part, step)
						} else if ("usage" == part.type) {
							usage = new Usage(part.usage)
						}
						parts.push(part)
					}
					await chat.save("parts", parts, step)
					if (error) throw error

					if ("resolved" === result._totalUsage?.status?.type) {
						usage = new Usage(result._totalUsage.status.value)
					}
					await chat.save("usage", usage, step)
					if (result._steps?.status?.type === "resolved") {
						const step0 = result._steps.status.value?.[0]
						if (step0?.usage) usage = new Usage(step0.usage)
						if (step0?.response?.headers) {
							const limits = Object.fromEntries(
								Object.entries(step0.response.headers).filter(([k]) =>
									k.startsWith("x-ratelimit-")
								)
							)
							usage.limits = new Limits(limits)
						}
					}

					await chat.save({ response: result, parts, chunks, unknowns, reason, answer, usage, step })

					return { answer, reason, usage, unknowns, timeInfo }
				})()

				const finalResult = await Promise.race([streamPromise, timeoutPromise])
				if (timeoutTimer !== undefined) clearTimeout(timeoutTimer)
				clearInterval(chatting)

				ui.console.info("")

				// 3. Log success statistics to stats.nan0
				const durationMs = Date.now() - startTime
				const speedTps = usage.outputTokens / (durationMs / 1000)
				const costs = { input: 0, reason: 0, output: 0 }
				currentModel.pricing.calc(usage, costs)
				const costUsd = costs.input + costs.reason + costs.output
				const queryEfficiency = speedTps > 0 ? costUsd / speedTps : 0

				const statData = {
					chatId: chat.id || 'unassigned',
					modelId: currentModel.id,
					provider: currentModel.provider,
					tokensInput: usage.inputTokens,
					tokensOutput: usage.outputTokens,
					durationMs,
					speedTps,
					costUsd,
					queryEfficiency,
					taskEfficiency: 1.0 / ((costUsd || 0.0001) * (durationMs / 1000 || 0.1)),
					status: 'success'
				}
				await StatsCollector.appendStat(statData)

				if (finalResult.timeInfo) {
					const table = [
						["queue", finalResult.timeInfo.queue_time],
						["prompt", finalResult.timeInfo.prompt_time],
						["completion", finalResult.timeInfo.completion_time],
						["total", finalResult.timeInfo.total_time],
					]
					ui.console.debug(`- Timings: ${table.map(([t, v]) => `${t} - ${ui.formats.timer(1e3 * Number(v))}`).join(" | ")}`)
				}
				if (!usage.limits.empty) {
					const table = Object.entries(usage.limits).map(([t, v]) => `${t} - ${ui.formats.count(v)}`).join(" | ")
					ui.console.debug(`@ Limits: ${table}`)
				}

				return finalResult

			} catch (errorObj) {
				const err = /** @type {any} */ (errorObj)
				if (timeoutTimer !== undefined) clearTimeout(timeoutTimer)
				clearInterval(chatting)
				ui.console.info("")

				const errorCode = err.message === 'TIMEOUT' ? 'TIMEOUT' : String(err.status || err.statusCode || 'error')
				
				// Log failure stats to stats.nan0
				const durationMs = Date.now() - startTime
				const statData = {
					chatId: chat.id || 'unassigned',
					modelId: currentModel.id,
					provider: currentModel.provider,
					tokensInput: usage.inputTokens,
					tokensOutput: usage.outputTokens,
					durationMs,
					speedTps: 0,
					costUsd: 0,
					queryEfficiency: 0,
					taskEfficiency: 0,
					status: errorCode
				}
				await StatsCollector.appendStat(statData)

				lastError = err

				const shouldFallback = strategy.fallbackCodes.includes(errorCode) || strategy.fallbackCodes.includes('error')
				if (shouldFallback) {
					attempt++
					if (attempt < maxAttempts) {
						ui.console.warn(`[AiStrategy] Attempt ${attempt} failed with code ${errorCode}. Retrying same model...`)
						continue
					}

					failoverCount++
					if (failoverCount > strategy.failoverLimit) {
						ui.console.error(`[AiStrategy] Failover limit of ${strategy.failoverLimit} reached. Aborting.`)
						break
					}

					ui.console.warn(`[AiStrategy] Model ${currentModel.id} failed with ${errorCode}. Falling back to next model in queue...`)
					break
				} else {
					throw err
				}
			}
		}
	}

	throw lastError || new Error('All models in cascade queue failed.')
}
