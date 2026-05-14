import assert from 'node:assert';
import test from 'node:test';
import { YouTubeAdapter } from '../src/adapters/youtube.js';
import fs from 'node:fs';

test('YouTubeAdapter завантажує відео (dry-run)', async () => {
    // Для демо ми не стягуємо реальне відео, а лише парсимо інформацію (симуляція --simulate або просто перевірка ініту)
    // Оскільки ми не хочемо засмічувати диск, використовуємо легкий лінк на аудіо
    const intent = new YouTubeAdapter({
        url: 'https://www.youtube.com/watch?v=BaW_VrZ6s3A', // Якесь коротке відео для тесту
        format: 'audio'                                    // Тільки аудіо (швидше)
    });

    console.log('[+] Створено Intent для:', intent.url);
    console.log('[⏳] Запускаємо завантаження...');
    
    // Тут ми зробимо помилковий виклик без URL, щоб перевірити throw
    const emptyIntent = new YouTubeAdapter();
    await assert.rejects(
        () => emptyIntent.load(),
        /Помилка: Не вказано URL ресурсу YouTube/
    );

    // Якщо у вас на комп'ютері є yt-dlp, можна зняти коментар нижче:
    // await intent.load('./play');
    // assert.strictEqual(intent.status, 'completed');
    // assert.strictEqual(intent.progress, 100);
});
