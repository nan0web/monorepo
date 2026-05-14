import { VisualAdapter as BaseVisualAdapter } from '@nan0web/ui/testing'

/**
 * VisualAdapter (Voice / Audio)
 * 
 * Рендерить інтенції у форматі текстових транскриптів (SSML/Text).
 */
export class VisualAdapter extends BaseVisualAdapter {
    /**
     * Конвертує інтенцію у "ГолосовийSnapshot" (Text-to-Speech Transcript).
     */
    static render(intent, t = (k) => k) {
        if (intent.type === 'ask') {
            return `[VOICE PROMPT] "${t(intent.schema?.help || '')}" (Waiting for: ${intent.input})`
        }
        if (intent.type === 'log') {
            return `[AUDIO LOG] ${intent.level.toUpperCase()}: ${JSON.stringify(intent.message)}`
        }
        return super.render(intent, t)
    }
}
