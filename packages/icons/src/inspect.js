import { IconsAuditor } from './domain/IconsAuditor.js'

/**
 * Inspector Plugin Exports
 * Exposes a structured object of all auditors for this package.
 * This allows @nan0web/inspect to dynamically load and iterate over them.
 */
export const auditors = {
	[IconsAuditor.alias]: IconsAuditor
}
