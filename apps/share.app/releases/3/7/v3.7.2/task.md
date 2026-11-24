---
version: 3.7.2
type: patch
status: done
locale: uk
models:
  - DownloadWhisperCommand
  - MediaDownloadModel
  - YouTubeDownloader
---

# 🎬 Mission: Save Video in download:whisper (--save-video) (v3.7.2)

## 🏁 Overview (Огляд)

Патч-реліз `v3.7.2` додає підтримку збереження відеофайлу разом із транскриптом у команді `visnyk download:whisper` через прапорець `--save-video` (або `--keep-video`).

---

## 🔑 Ключові вимоги (Definition of Done)

### 1. Опція `--save-video` у `DownloadWhisperCommand`
- `DownloadWhisperCommand` має статичне поле `saveVideo` (`type: 'boolean'`, `default: false`).
- Передає `saveVideo` та `output` у `MediaDownloadModel`.
- Повідомляє користувача про шлях збереженого відео та повертає `videoPath` у `result(...)`.

### 2. Завантаження відео через `YouTubeDownloader` / `YouTubeDownloaderPort`
- `YouTubeDownloader.downloadVideo(url, outputDir, onProgress, options)` делегує до `port.downloadVideo`.
- `YouTubeDownloaderPort.downloadVideo` завантажує відео (без `-x`, з `--merge-output-format mp4`) та підтримує кастомне ім'я файлу (`options.filename`).

### 3. Збереження відео поруч із текстом у `MediaDownloadModel`
- Коли `saveVideo: true` і `url` віддалений:
  - Якщо вказано `output` (наприклад, `out/talk.txt`), відео зберігається поруч (`out/talk.mp4`).
  - Якщо `output` не вказано, відео зберігається в поточній директорії (`.`) з назвою відео (`<title>.mp4`).
  - Завантажений відеофайл **не видаляється** після завершення транскрибації, на відміну від тимчасового аудіо.

---

## 📂 Target Files

- `apps/share.app/src/domain/YouTubeDownloader.js`
- `apps/share.app/src/ports/YouTubeDownloaderPort.js`
- `apps/share.app/src/domain/MediaDownloadModel.js`
- `apps/share.app/src/domain/commands/DownloadWhisperCommand.js`
