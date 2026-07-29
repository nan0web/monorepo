# @nan0web/share.app — Vlog Pipeline: Status & Remaining Work

What has been ported from `apps/3rdparty/will-n-i/next.md` into `share.app`, what still needs to be done, and how to test it.

---

## 1. What is already done (ported)

### CLI Commands (via `bin/share.js` and `src/index.js`)

| Command | File | Status |
|---------|------|--------|
| `share download:whisper` | `src/domain/commands/DownloadWhisperCommand.js` | Done — audio download (yt-dlp), chunking (ffmpeg), Whisper transcription (mlx/openai/cpp auto-detect) |
| `share generate:subtitles` | `src/domain/commands/SubtitleGenerateCommand.js` | Done — Whisper JSON -> .ASS subtitles |
| `share compile:video` | `src/domain/commands/VideoCompileCommand.js` | Done — FFmpeg compilation (subtitle overlay, shorts concat) |
| `share generate:shorts` | `src/domain/commands/ShortsGenerateCommand.js` | Done — Shorts slicing + thumbnail embedding |
| `share publish` | `src/domain/commands/PublishCommand.js` | Done — multi-platform publishing |

#### `download:whisper` Reference

| Option      | Description | Default |
|-------------|-------------|---------|
| `--url`     | YouTube URL or local file path | **required** |
| `--format`  | Output format: `txt`, `srt`, `vtt`, `json` (word-level timestamps). Auto-detected from `--output` extension | `txt` |
| `--quality` | Whisper model: `tiny`, `base`, `small`, `medium`, `large`, `turbo` | `medium` |
| `--output`  | Output file path (saved to current directory). If omitted, prints to stdout | — |

**Output formats:**
- `txt` — plain text
- `json` — structured JSON with `segments[].{start, end, text, words[].{word, start, end, probability}}`
- `srt` / `vtt` — timestamped subtitle formats

### Adapters

| Adapter | Status |
|---------|--------|
| `YouTubeAdapter` | Real — googleapis OAuth2, video upload |
| `MediumAdapter` | Real — REST API, post creation |
| `IPFSAdapter` | Stub (returns mock CID) |
| `ArweaveAdapter` | Stub (returns mock txId) |
| `TelegramAdapter` | Real (since v1.0.0) |

### Domain Generation Modules

| Module | Status |
|--------|--------|
| `VideoCompiler` | Stub — returns `{ ok: true, outputPath }` |
| `ShortsGenerator` | Stub — returns `{ ok: true, count: 4 }` |
| `ThumbnailGenerator` | Stub — returns `{ ok: true, outputPath }` |
| `TrendAnalyzer` | Stub — returns mock trends |

### Tests (v3.2.0)

File: `src/test/releases/v3.2.0.spec.js`
Validates imports of all modules — VideoCompiler, ThumbnailGenerator, ShortsGenerator, YouTubeAdapter, MediumAdapter, IPFSAdapter, ArweaveAdapter, TrendAnalyzer.

---

## 2. What still needs work

### Step 1: JS chunker preprocessor (JSON -> ASS)

From `next.md`: _"Script takes the detailed Whisper JSON and groups words into blocks of 1-3 words so they don't exceed 850px screen width"_

- `SubtitleGenerateCommand.js` already generates ASS but uses a simple `maxLineLength` -- needs a chunker that calculates text width for the chosen font
- **Todo**: either a standalone `src/domain/generation/SubtitleChunker.js` module or extend `SubtitleGenerateCommand.js`

### Step 2: ASS integration into generate:shorts

- `ShortsGenerateCommand.js` creates placeholder subtitles but doesn't use the real ASS output
- **Todo**: wire `SubtitleGenerateCommand` into the Shorts slicing loop

### Step 3: Puppeteer/Lit renderer (for online version)

From `next.md`: _"For the online version and complex animations -- Lit component + Puppeteer frame-by-frame rendering"_

- Not implemented. `src/ui/lit/ShareWeb.js` exists but is a distribution UI, not a subtitle renderer
- **Todo**: `src/domain/generation/PuppeteerRenderer.js` -- headless Chromium frame capture piped to FFmpeg

### Step 4: Shorts-to-16:9 compiler

From `next.md`: _"Script that takes an array of Shorts and concatenates them into one long 16:9 horizontal video with boxblur"_

- Not implemented
- **Todo**: `src/domain/generation/ShortsToLongCompiler.js`

### Hardware Acceleration (Apple Silicon M1)

- `ShortsGenerateCommand` has a `useHardwareAcceleration` flag wired to `h264_videotoolbox`
- But the actual codec switching is not integrated into `VideoCompileCommand`
- `download:whisper` automatically uses mlx_whisper on Apple Silicon (no CUDA/ROCm needed)

---

## 3. How to test

### Basic tests

```bash
cd apps/share.app
npm test                    # unit tests (120 specs)
npm run test:release        # release tests (including v3.2.0)
npm run test:all            # full pipeline
```

### CLI dry-run (with mocks)

```bash
# Verify CLI without real FFmpeg/Whisper
node bin/share.js compile video /tmp/test-episode
node bin/share.js shorts /tmp/test-shorts.yaml
node bin/share.js publish /tmp/content.json /tmp/rules.json
node bin/share.js trends
```

### Integration test (requires yt-dlp, FFmpeg and mlx_whisper installed)

```bash
# 1. Download and transcribe YouTube Shorts
node bin/share.js download:whisper \
  --url "https://youtube.com/shorts/OSO041u-gFk?feature=share" \
  --format json --output tr.json --quality medium

# 2. View the result
cat tr.json | head -50

# Available output formats
node bin/share.js download:whisper \
  --url "https://youtube.com/shorts/OSO041u-gFk?feature=share" \
  --output tr.txt

# Available model qualities
node bin/share.js download:whisper \
  --url "https://youtube.com/shorts/OSO041u-gFk?feature=share" \
  --format json --quality large --output tr-large.json
```

### Adapter verification (requires API keys)

```bash
# YouTube — verify via googleapis
node -e "import { YouTubeAdapter } from './src/adapters/YouTubeAdapter.js'; new YouTubeAdapter({ clientId: '...', clientSecret: '...', refreshToken: '...' }).verify().then(console.log)"

# Medium — verify via REST API
node -e "import { MediumAdapter } from './src/adapters/MediumAdapter.js'; new MediumAdapter({ token: '...' }).verify().then(console.log)"
```