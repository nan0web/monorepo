---
description: Канонічний профіль tsconfig.json для Lit, Web Components та чистих Web DOM пакетів
---

# 💡 Рецепт: TSConfig для Lit / Web Components (`lit`)

> **Призначення:** Стандартизована конфігурація TypeScript для Lit-компонентів, Web Components та клієнтських веб-бібліотек без використання JSX.

---

## 1. Канонічний `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "bundler",
    "lib": ["esnext", "dom", "dom.iterable"],
    "declaration": true,
    "declarationMap": false,
    "emitDeclarationOnly": true,
    "outDir": "./types",
    "rootDir": "./src",
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "allowSyntheticDefaultImports": true,
    "allowJs": true,
    "checkJs": false
  },
  "include": ["src/**/*"],
  "exclude": [
    "node_modules",
    "src/test",
    "**/*.spec.js",
    "**/*.story.js",
    "**/*.test.js",
    "src/docs/**/*.md.js"
  ]
}
```

---

## 2. Ключові прапорці компілятора

- `lib`: `["esnext", "dom", "dom.iterable"]` — доступ до Web Components API (`customElements`, `ShadowRoot`, `HTMLElement`).
- `jsx`: відсутній або не вказаний (оскільки Lit використовує tagged template literals `html`...``).
- `moduleResolution`: `"bundler"` (або `"nodenext"` для чистих ESM пакетів) — підтримка експортів залежностей без трансляції JSX.
- `declaration`: `true`, `emitDeclarationOnly`: `true`, `outDir`: `"./types"` — забезпечення типізації для Lit-компонентів.
