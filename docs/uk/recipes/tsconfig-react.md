---
description: Канонічний профіль tsconfig.json для React, JSX, Next.js та UI-пакетів
---

# ⚛️ Рецепт: TSConfig для React / JSX / Next.js (`react`)

> **Призначення:** Стандартизована конфігурація TypeScript для React-пакетів, компонентів, веб-додатків та Next.js середовища.

---

## 1. Канонічний `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "bundler",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "react-jsx",
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
    "**/*.spec.tsx",
    "**/*.story.js",
    "**/*.test.js",
    "src/docs/**/*.md.js"
  ]
}
```

---

## 2. Ключові прапорці компілятора

- `moduleResolution`: `"bundler"` — сучасна резолюція для бандлерів (Vite, Next.js / Turbopack, Webpack), що підтримує імпорти пакетів без примусових `.js` розширень у JSX/TSX.
- `jsx`: `"react-jsx"` — оптимізована компіляція JSX без необхідності робити `import React from 'react'`.
- `lib`: `["dom", "dom.iterable", "esnext"]` — доступ до Web API та браузерних інтерфейсів (DOM, Event, Request, Storage).
- `declaration`: `true`, `emitDeclarationOnly`: `true`, `outDir`: `"./types"` — ізоляція типізації компонентів у `.d.ts`.
