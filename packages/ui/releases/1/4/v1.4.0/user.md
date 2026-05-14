# User Release Notes - v1.4.0

## UI Improvements & Fixes

- **Master IDE Navigation (SPA)**: The IDE now uses client-side history API (PushState) for seamless component switching! Navigating between components or changing the language updates the URL immediately and triggers an instant re-render without reloading the page. The browser's native Back/Forward buttons work correctly.
- **Master IDE Theme**: Light and dark themes are now strictly propagated to the component canvas and properties editor. `Accordion`, `Toast`, and `Autocomplete` are now fully visible and styled correctly in the Light theme!
- **Master IDE Sidebar Active Scroll**: When opening the IDE directly to a specific component (e.g. `Toast`), the sidebar automatically scrolls the selected item directly into view.
- **Component Artifact Fix**: Excluded utility files like `_/langs.yaml` from accidentally being parsed as UI components (which previously caused a broken "Langs" item in the sidebar).
- **Master IDE Logo**: Added a minimal SVG vector logo for `NaN•Web Master IDE` in the sidebar header to give it a more branded and premium look.
- **Theme Persistence**: Theme preferences are persistently saved in `localStorage`.
- **Component Variants**:
  - You can rename custom variants inline.
  - "Delete variation" buttons are cleanly displayed for non-built-in variants.
- **YAML Code Generation**: The Code Tab now exports perfectly formatted native YAML snippets.
- **Categorized Sidebar List**: The Master IDE component list is no longer a massive flat list. It's now semantically grouped into `Actions`, `Forms & Inputs`, `Data Display`, `Feedback`, and `System` categories, making exploration much easier and organized.
- **Props Pane Layout Fixes**: Form inputs in the properties editor panel no longer overflow their parent container boundaries.
- **CodeBlock Rendering Improvements**:
  - `CodeBlock` properties typed as `text/javascript` or other specific texts seamlessly open as a multi-line Textarea editor instead of a single string input.
  - Light mode `CodeBlock` instances now accurately render with a crisp white background instead of keeping a harsh dark gray fallback.
