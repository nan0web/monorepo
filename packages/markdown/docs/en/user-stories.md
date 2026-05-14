# User Stories: Documentation Integrity Audit

## Story 1: Validating Internal Links
**As an** Architect,
**I want** the auditor to confirm that all relative links within the `docs/` folder point to existing files,
**So that** users don't encounter 404 errors when navigating.

### Scenario: Link to existing file
- **Given** a file `docs/README.md` containing `[Go to Index](./index.md)`
- **And** a file `docs/index.md` exists
- **When** I run `nan0inspect provendocs .`
- **Then** no errors should be reported for this link.

### Scenario: Link to missing file
- **Given** a file `docs/README.md` containing `[Broken Link](./missing.md)`
- **And** `docs/missing.md` does NOT exist
- **When** I run `nan0inspect provendocs .`
- **Then** I should see an error: `Broken link in docs/README.md: ./missing.md`

## Story 2: Validating Anchors
**As an** Architect,
**I want** to be sure that all anchors (headers) referenced in links actually exist in the target files,
**So that** deep links work correctly.

### Scenario: Valid local anchor
- **Given** `docs/README.md` has a header `## Features`
- **And** a link `[Features](#features)`
- **When** I run the audit
- **Then** no anchor errors should be reported.

### Scenario: Missing local anchor
- **Given** `docs/README.md` has NO header `## Setup`
- **And** a link `[Setup](#setup)`
- **When** I run the audit
- **Then** I should see an error: `Missing anchor #setup in docs/README.md`

### Scenario: Valid cross-file anchor
- **Given** `docs/en/architecture.md` has a header `## Models`
- **And** `docs/README.md` has a link `[Models](./en/architecture.md#models)`
- **When** I run the audit
- **Then** no anchor errors should be reported.

## Story 3: Structural Integrity
**As an** Architect,
**I want** the auditor to enforce a mandatory documentation structure (index, README, langs),
**So that** the project remains searchable and translatable.

### Scenario: Missing index
- **Given** `docs/index.md` is missing
- **When** I run the audit
- **Then** I should see an error regarding the missing index.
