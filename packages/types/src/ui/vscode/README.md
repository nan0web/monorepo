# NaN0 Language Support

[NaN0](https://github.com/nan0web/types) is a minimal, human-readable serialization format designed for high-performance typed data. It serves as a faster subset of YAML/Markdown, bridging the gap between JSON's speed and YAML's readability.

This official extension provides native support for `.nan0` and `.n0` files in Visual Studio Code.

## Features ✨

- **Syntax Highlighting**: Beautiful, distinct colors and scopes for NaN0 native types (comments, numbers, dates, booleans, null, multiline strings, arrays).
- **Format Normalization**: Ensures your team never fights over indents. Formatting a document strictly enforces the official NaN0 standard (2-space indentation), preventing runtime errors.
- **Auto-Closing**: Smart brackets `{}`, arrays `[]`, and quotes `""`.
- **Indentation Folding**: Easily collapse nested objects and arrays.

## Example

```nan0
# This is a sample NaN0 configuration
app:
  name: "NaN0 Web Application"
  version: 1.5.0
  launched: 2026-03-26

# Nested sections
settings:
  features:
    - metrics
    - tracing
  welcome_message: |
    Welcome to the future of web architecture.
    Zero represents everything.
```

## Principles 🏛

Part of the **NaN•Web Platform**, adhering to **Total Logic Isolation** and **One Logic — Many UI** principles. The extension itself is a thin UI–adapter over the core `@nan0web/types` validation engine.
