# Features & Progress: @nan0web/ui-react

## Accomplished
- **Directory Structure Standardized**: Renamed `playground` to `play` across the package.
- **Vite Integration**: Updated `vite.config.js` and `index.html` to serve the playground from the root using the `/play/` prefix.
- **E2E Testing Base**: Added `@playwright/test` and configured it to run against the dev server on port 4246.
- **Sandbox Showcase**: Created `SandboxApp` to demonstrate core components:
    - **TreeView**: Expanding/collapsing folders and files.
    - **Autocomplete**: Searching and selecting options.
    - **Typography**: Responsive headings and text variants.
    - **Buttons**: Variant showcase.
- **Core Rendering Fixes**:
    - Enhanced `renderTypography` and `renderAutocomplete` for robust declarative data handling.
    - Injected `refresh` action into `AppInstance` in `Element.jsx` to allow apps to trigger re-renders (essential for language switching).
- **Test Coverage**: All 4 E2E tests for the Sandbox are **PASSING**.

## Component Migration Plan (from I-Bank)
- **Base Components**:
    - `GDPRConsent`: Headless logic for cookie consent.
    - `FeedbackForm`: Core form submission logic with validation.
    - `SearchModal`: Shared autocomplete and results display.
    - `NewsPost`: Generic article/post template.
- **Exclusions (Proprietary)**: Calculators, Banking Lists, and Order Forms will remain in `ibank.ua`.

## Remaining / Next Steps
- **Extraction**: Migrate the "Base Components" identified above from `ibank.ua` to `@nan0web/ui-react`.
- **Additional Elements**: Add Forms, Modals, and Cards to the Sandbox showcase.
- **Interactive Props**: Implement a "Props Editor" within the Sandbox.
- **Release Candidate**: Prepare for `v1.2.0` with full component parity.
