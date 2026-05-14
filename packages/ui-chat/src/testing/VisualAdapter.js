import { VisualAdapter as BaseVisualAdapter } from '@nan0web/ui/testing'

/**
 * VisualAdapter (Chat / Messaging)
 * 
 * Рендерить інтенції у форматі чат-бульбашок (Bubble Snapshot).
 */
export class VisualAdapter extends BaseVisualAdapter {
    /**
     * Конвертує інтенцію у "ChatSnapshot" (User/Bot messages).
     */
    static render(intent, t = (k) => k) {
        if (intent.type === 'ask') {
            return `
[BOT]: "${t(intent.schema?.help || '')}"
[USER]: (Inputting: ${intent.input})`
        }
        if (intent.type === 'log') {
            return `[SYSTEM ${intent.level.toUpperCase()}]: ${JSON.stringify(intent.message)}`
        }
        return super.render(intent, t)
    }
}
