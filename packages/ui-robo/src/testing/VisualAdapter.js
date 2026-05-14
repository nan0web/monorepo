import { VisualAdapter as BaseVisualAdapter } from '@nan0web/ui/testing'

/**
 * VisualAdapter (Robotics / Hardware)
 * 
 * Рендерить інтенції у форматі апаратних команд (Command Transcript).
 */
export class VisualAdapter extends BaseVisualAdapter {
    /**
     * Конвертує інтенцію у "RoboSnapshot" (Actions: Move, Sense, Act).
     */
    static render(intent, t = (k) => k) {
        if (intent.type === 'ask') {
            return `[ROBO SENSE] "${t(intent.schema?.help || '')}" (Wait logic: ${intent.input})`
        }
        if (intent.type === 'log') {
            const levelMap = { 'info': 'ACT', 'warn': 'CAUTION', 'error': 'HALT', 'success': 'OK' }
            return `[ROBO ${levelMap[intent.level] || 'EVENT'}] ${JSON.stringify(intent.message)}`
        }
        return super.render(intent, t)
    }
}
