# Feature: Semantic Vector Search & Universal File Indexing (`nan0ai find`)

## Objective
Implement a universal, content-aware semantic search CLI command `nan0ai find "<query>" [path]` in `@nan0web/ai` that automatically indexes all supported file formats in a target directory (using global embedding/VLM/STT config) and returns ranked semantic matches without polluting the filesystem with intermediate files.

## CLI Interface
- `nan0ai find "<query>" [path]` — semantic search in `[path]` (defaults to `.`).
  - If no index exists for `[path]`, prompt the user to create one (or auto-index with `--auto-index`), build the vector index, and execute the search.
  - Supports inline or flag-based result filtering: e.g. `type:image`, `type:video`, `type:pdf`, `type:audio`, `type:doc`, or `--type image,video`.
  - `--check-dup` / `--top <n>` — return top-$N$ matches with exact file paths, line/timestamp ranges, and similarity scores (useful for deduplication checks).
- `nan0ai index [path]` — explicitly build or incrementally update the index (based on file `mtime` / content hash).
  - `--watch` — background incremental indexing on file changes.

## Indexing Pipeline (In-Memory Extraction, Zero-Trash)
All supported formats are indexed uniformly into the vector store; `type:*` filters are applied **at query/retrieval time**, not by skipping formats during indexing.

1. **Plain Text & Code:** `.md`, `.txt`, `.json`, `.js`, `.ts`, `.yaml`, etc. — read and chunk directly.
2. **Documents & Spreadsheets:** `.pdf`, `.doc`, `.ppt`, `.pptx`, `.docx`, `.xlsx`, `.csv` — extract text/tables in memory (temporary buffer only, no `.txt` files written to disk).
3. **Images:** `.jpg`, `.jpeg`, `.png`, `.webp`, `.heic` — extract EXIF metadata (date, GPS/location if present) + generate semantic description via configured VLM / OCR.
4. **Audio:** `.m4a`, `.mp3`, `.wav`, `.ogg` — transcribe speech to text via configured STT (e.g., Whisper) with timestamps.
5. **Video:** `.mp4`, `.mov`, `.mkv`, `.webm` — extract audio track in memory for STT transcription + optional keyframe descriptions via VLM.

What else formats might be indexable? Consider before planning.

## Configuration & Storage
- Read embedding model, chunk size, VLM, and STT providers from global `nan0ai` config.
- Store vector index and file hashes in a dedicated cache/index directory (e.g., `~/.cache/nan0ai/index/` or local `.nan0ai/`), respecting `.gitignore` / ignore rules.
- Incremental updates: re-index only new or modified files (`mtime` / SHA-256).

## Example Queries
- `nan0ai find "Свідки Єгови Вихід 21:16" /Users/i/arch/books/myt`
- `nan0ai find --only image "photo with a dog near the pond" ~/Pictures`
- `nan0ai find --only pdf "electricity bill autumn" ~/Documents`
- `nan0ai find "deurbanization and 500 CZK type:audio,video" /Users/i/arch/diary`

## Acceptance Criteria
- [ ] `nan0ai find` detects missing index, prompts for indexing, indexes supported formats in memory without creating leftover `.txt` files, and returns ranked results.
- [ ] `type:*` filters work at retrieval time across text, docs, images, audio, and video.
- [ ] Incremental re-indexing skips unchanged files.
- [ ] Unit and integration tests cover chunking, in-memory extraction adapters, filtering, and incremental updates.
