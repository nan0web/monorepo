# User Guide: Lazy Loading of UI Adapters (v3.3.0)

## Overview
This release introduces **lazy loading** for heavyweight UI modules such as **Chat** and **Voice**. The initial bundle size is kept under **200 KB**, and additional adapters are fetched on‑demand, improving page load speed.

## How it works
- The main page shows two buttons: **Show Chat** and **Show Voice**.
- Clicking a button triggers the `loadAdapter(name)` helper which:
  1. Shows a loading spinner.
  2. Dynamically imports the requested module via `import()`.
  3. Reads the module’s file size (`import.meta.url`) and estimates load time using `performance.now()`.
  4. Displays the estimated size and load time before the UI appears.
- If loading fails, a graceful fallback UI is rendered.

## User‑Facing Commands
| Action | UI Trigger | Description |
|--------|------------|-------------|
| Show Chat | **Show Chat** button | Loads `src/ui/chat/ChatAdapter.js` on demand.
| Show Voice | **Show Voice** button | Loads `src/ui/voice/VoiceAdapter.js` on demand.
| Reload UI | Browser reload | Returns to the lightweight initial bundle.

## Expected Benefits
- Faster initial page render.
- Reduced bandwidth for users on slow connections.
- Improved perceived performance through load‑time estimates.

## Compatibility
- Works in modern browsers supporting ES modules and dynamic `import()`.
- No impact on existing CLI, Chat, or Voice interfaces – they remain available via the same lazy‑loading mechanism.

## Troubleshooting
- **Spinner never hides** – Check console for import errors; ensure the module path is correct.
- **Incorrect size estimate** – Verify that `import.meta.url` resolves to the correct file.

---
*Generated automatically for release v3.3.0.*
