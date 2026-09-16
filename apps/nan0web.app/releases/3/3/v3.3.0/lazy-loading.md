# Lazy Loading of UI Adapters

**Goal**: Load heavy UI modules (Chat, Voice) only on demand to reduce initial bundle size.

- Introduce a lightweight loader `loadAdapter(name)` returning a Promise that dynamically `import()`s the required module.
- UI entry points (`index.html`) expose buttons **Show Chat** / **Show Voice**. On click, show loading spinner, fetch module weight via `import.meta.url` and estimate load time (e.g., using `performance.now()`).
- Show UI weight (KB) and estimated time (`≈ ${sizeKB} KB → ${estimate}s`) before proceeding.
- Fallback UI if loading fails.
- Update `src/ui/chat/ChatAdapter.js` and `src/ui/voice/VoiceAdapter.js` to export a default async `init()` used by the loader.

**Verification**:

- Run `npm run build` and ensure initial bundle < 200 KB.
- Measure lazy load times in Chrome devtools.
- Snapshot tests for loader behavior.
