# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-04-04
### Added
- `AuthPolicy`: Model-as-Schema implementation for strict URL access control.
- Glob syntax matching (`**` for any depth, `*` for single segment) in `protectedPaths` and `publicPaths`.
- Proper public path override mechanics for protected wildcard routes.
- `AuthMiddleware` and `setupApi` exports for App-in-App integration via `src/ui-api/index.js`.
- Expanded `.md` architectural and usage specifications (`user-stories.md` with 37 canonical stories).
- Regression test suite migration for the v1.1.0 contract tests (`src/test/releases/1/1/v1.1.0/task.test.js`).

## [1.0.0] - 2026-03-24
### Added
- Core headless authentication application logic (Sign up, Log in, Confirm flow).
- `AuthApp.js` as the central dispatcher model.
- Essential Models and Input Adapters for basic terminal usage.
- Coverage of core scenarios (US-01 through US-23, US-33 through US-35) in `src/AuthApp.test.js` and `src/ui-cli/AuthCLI.test.js`.
