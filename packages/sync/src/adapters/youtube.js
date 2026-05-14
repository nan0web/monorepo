import { spawn } from 'node:child_process';
import { DownloadIntent } from '../domain/DownloadIntent.js';

/**
 * YouTubeAdapter
 * Імплементація наміру стягнення (Download) відео/аудіо з платформи YouTube.
 * Використовує `yt-dlp` під капотом (найстабільніше відкрите рішення).
 */
export class YouTubeAdapter extends DownloadIntent {
  constructor(data = {}) {
    super(data);
  }

  /**
   * Фізичне виконання наміру
   * @param {string} destDir Директорія для збереження (за замовчуванням data/youtube)
   * @returns {Promise<void>} 
   */
  async load(destDir = './data') {
    if (!this.url) throw new Error('Помилка: Не вказано URL ресурсу YouTube.');
    
    this.status = 'active';
    this.progress = 0;

    return new Promise((resolve, reject) => {
      // --newline потрібний для адекватного парсингу output: 
      const formatArgs = this.format === 'audio' 
        ? ['-x', '--audio-format', 'mp3'] 
        : ['-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best'];

      const args = [
        ...formatArgs,
        '-o', `${destDir}/%(title)s.%(ext)s`,
        '--newline', 
        this.url
      ];

      const yt = spawn('yt-dlp', args);

      yt.stdout.on('data', (data) => {
        const text = data.toString();
        // Парсинг прогресу для UI-CLI: "[download]  23.5% of ~10.00MiB..."
        const match = text.match(/\[download\]\s+(\d+\.\d+)%/);
        if (match) {
          this.progress = parseFloat(match[1]);
        }
      });

      yt.stderr.on('data', (data) => {
        const text = data.toString();
        if (!text.includes('Deleting original file')) {
           // Ігноруємо дрібні логи під час мерджу, але логуємо помилки
        }
      });

      yt.on('close', (code) => {
        if (code === 0) {
          this.status = 'completed';
          this.progress = 100;
          resolve(true);
        } else {
          this.status = 'error';
          reject(new Error(`yt-dlp процес завершився помилкою з кодом ${code}`));
        }
      });

      yt.on('error', (err) => {
        this.status = 'error';
        reject(new Error(`Системна помилка: yt-dlp не встановлено або недоступно в середовищі. Виконайте: brew install yt-dlp.\nКод: ${err.message}`));
      });
    });
  }
}
