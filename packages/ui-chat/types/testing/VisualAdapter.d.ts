/**
 * VisualAdapter (Chat / Messaging)
 *
 * Рендерить інтенції у форматі чат-бульбашок (Bubble Snapshot).
 */
export class VisualAdapter extends BaseVisualAdapter {
    /**
     * Конвертує інтенцію у "ChatSnapshot" (User/Bot messages).
     */
    static render(intent: any, t?: (k: any) => any): string;
}
import { VisualAdapter as BaseVisualAdapter } from '@nan0web/ui/testing';
