# NaN0 Data Format

**NaN0** is a minimal, human-readable serialization format designed for typed data. It balances the human-friendliness of YAML/Markdown with the parsing efficiency needed for performance-critical JS applications.

## General Rules

- **Indentation-based**: Uses two-space indentation to define nesting.
- **Top-level**: Can be an object (key-value) or an array.
- **Comments**: Start with `#`. Multi-line comments are supported via indentation.
- **Empty containers**: Represented as `{}` (object) and `[]` (array).

## Performance (Benchmark)

NaN0 was designed to significantly outperform YAML and standard Markdown while remaining more compact than JSON. Tested with ~21.8 kB payload (10,000 iterations):

| Формат    | Розм. (відн.) | Швидк. (проти JSON) | Сфера застосування |
|-----------|---------------|-----------------------|--------------------|
| **JSON**  | 100%          | **1.0x**              | Машинний обмін |
| **NaN0**  | 101.1%        | **2.1x**              | Логіка даних, конфіги |
| **MD+N0** | 100.3%        | **1.8x**              | Статті з метаданими |
| **YAML**  | 105.7%        | **65.0x - 66.0x**     | Системні налаштування |

*Використання NaN0 замість YAML для метаданих у Markdown дає **36-кратне пришвидшення** розбору. У майбутньому можливе ще значніше пришвидшення (до рівня нативного JSON) через впровадження опціонального WASM-двигуна на Rust чи C++.*

---

## Type System

| Type | Syntax | Result |
|------|--------|--------|
| **String** | `key: text` | JS String |
| **Multiline** | `key: \|` | Indented lines preserved |
| **Number** | `key: 1_234.5` | JS Number (supports underscores) |
| **Boolean** | `key: true` | JS Boolean |
| **Date** | `key: 2024-11-13` | JS Date |
| **Null** | `key: null` | JS null |

---

## Schema-Aware Parsing

The parser can infer types from static metadata of a provided `Body` class.

```javascript
class User {
  static age = { type: String } // Forces "30" instead of 30
}

const data = NaN0.parse('age: 30', { Body: User })
```

### Methods

- `NaN0.parse(text, context?)`: Converts NaN0 string to JS object.
- `NaN0.stringify(obj, context?)`: Converts JS object to NaN0 string.
- `context.comments`: An array where extracted comments are stored.
