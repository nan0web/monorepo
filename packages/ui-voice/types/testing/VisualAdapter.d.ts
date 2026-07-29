/**
 * VisualAdapter (Voice / Audio)
 *
 * Рендерить інтенції у форматі текстових транскриптів (SSML/Text).
 */
export class VisualAdapter extends BaseVisualAdapter {
    /**
     * Конвертує інтенцію у "ГолосовийSnapshot" (Text-to-Speech Transcript).
     */
    static render(intent: any, t?: (k: any) => any): string;
}
import { VisualAdapter as BaseVisualAdapter } from '@nan0web/ui/testing';
