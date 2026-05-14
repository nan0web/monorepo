/**
 * UI-CLI Integration for @nan0web/ui-react
 *
 * PlaygroundModel is a Data Schema (no Intent Flow).
 * Playground is launched via `scripts/play.js` (Node.js runner).
 *
 * This module re-exports the schema for CLI integrations
 * that need access to model metadata (port, defaults, i18n keys).
 */
export { PlaygroundModel } from '../../domain/PlaygroundModel.js'
