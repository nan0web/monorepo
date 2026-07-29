/**
 * VisualAdapter (Robotics / Hardware)
 *
 * Рендерить інтенції у форматі апаратних команд (Command Transcript).
 */
export class VisualAdapter extends BaseVisualAdapter {
    /**
     * Конвертує інтенцію у "RoboSnapshot" (Actions: Move, Sense, Act).
     */
    static render(intent: any, t?: (k: any) => any): string;
}
import { VisualAdapter as BaseVisualAdapter } from '@nan0web/ui/testing';
