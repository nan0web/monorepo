import { Model } from '@nan0web/ui'

/**
 * Global ecosystem metadata.
 */
export default class EcosystemModel extends Model {
	static schema = {
		version: { type: 'string', default: 'v3.0.0' },
		release_name: { type: 'string', default: 'Sovereign Audit' },
		author: { type: 'string', default: 'yaro' },
		foundation_year: { type: 'number', default: 2026 },
		commercial_status: { type: 'string', default: 'active' },
		license: { type: 'string', default: 'ISC' },
		agents: {
			type: 'object',
			default: {
				antigravity: { status: 'stable', role: 'orchestrator' },
				vscode: { status: 'beta', role: 'editor-companion' },
				cursor: { status: 'active', role: 'logic-enforcer' },
			},
		},
	}
}
