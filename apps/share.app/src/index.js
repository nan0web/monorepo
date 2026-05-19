/**
 * @nan0web/share.app — Sovereign Social Distribution Layer
 *
 * Public API surface for the share.app engine.
 */

// Models (real classes with schema introspection)
export {
	Model,
	SocialAdapterConfig,
	SocialAdapterLimits,
	SocialAdapterContent,
	SocialAdapterFeedback,
	SocialAdapterTarget,
	SocialAdapterValidationError,
	createConfig,
	createLimits,
	createContent,
	createFeedback,
	createTarget,
} from './domain/Models.js'
export { MediaDownloadModel } from './domain/MediaDownloadModel.js'
export { YouTubeDownloader } from './domain/YouTubeDownloader.js'
export { AudioSplitter } from './domain/AudioSplitter.js'

// Core Protocol
export { SocialAdapter, NotImplementedError } from './domain/SocialAdapter.js'
export { DummyAdapter } from './domain/DummyAdapter.js'

// Rules Engine
export { parseDelay, matchesConditions, evaluateRules, executeTasks } from './domain/RulesEngine.js'

// Adapters
export { TelegramAdapter } from './adapters/TelegramAdapter.js'

