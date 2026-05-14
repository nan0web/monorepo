# NaN0 Data Format

**NaN0** is a minimal, human-readable serialization format designed for high-performance typed data. It was architectically designed as a **faster subset of YAML/Markdown**, specifically optimized for performance-critical JavaScript applications while keeping the human-friendly indentation-based syntax.

---

## ⚡ Performance Benchmark (macOS, ~21 kB)

NaN0 closes the gap between the speed of native JSON and the readability of YAML/Markdown.

| Format          | Library    | Size (rel.) | Parse Speed (vs JSON) | Why use it? |
|-----------------|------------|-------------|-----------------------|-------------|
| **JSON**        | Native V8  | 100%        | **1.0x**              | Best for protocols |
| **NaN0**        | Core JS    | 101.1%      | **2.1x**              | **Fastest human format** |
| **MD+N0**       | Hybrid     | 100.3%      | **1.8x**              | Articles with metadata |
| **YAML**        | `yaml` lib | 105.7%      | **65.0x**             | Industry standard |
| **MD (YAML)***  | `yaml` lib | 103.6%      | **66.0x**             | Default Jekyll/Hugo |

> \* **Standard MD (YAML)** uses standard YAML frontmatter. By switching to **MD+NaN0**, you get a **36x parsing speedup** for articles with metadata.

---

## Technical Design: A YAML Subset

NaN0 implements the most essential features of YAML (indentation, key-value pairs, arrays, comments) but strips away the complex, slow parts (heavy tags, multiple document markers, complex anchors) to achieve:
1.  **Direct Mapping**: One line = one node (usually).
2.  **No splitting dependencies**: Designed for one-pass scanning.
3.  **Round-trip safety**: Preserves comments and exact types (including Date/Number).

## General Syntax

- **Indentation**: Two spaces strictly defines nesting.
- **Top-level**: Can be an object or an array.
- **Comments**: Start with `#`. Multi-line comments are supported via indentation.
- **Empty containers**: `{}` (object) and `[]` (array).

## Schema-Aware Parsing

You can pass a `Body` class to infer types (e.g., force String for numeric codes like `007`).

```js
import NaN0 from "@nan0web/types"
class User {
  static code = { type: String }
}

// "007" remains a string instead of becoming Number(7)
const data = NaN0.parse('code: 007', { Body: User })
```

### Main Methods

- `NaN0.parse(text, context?)`: Decode NaN0 to JS.
- `NaN0.stringify(obj, context?)`: Encode JS to NaN0.
- `context.comments`: Access/Inject comments by key name or index.
