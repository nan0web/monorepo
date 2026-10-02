---
description: Канонічний профіль tsconfig.json для Node.js, CLI, DB та службових пакетів
---

# 🛠 Рецепт: TSConfig для Node.js / CLI / DB (`node`)

> **Призначення:** Стандартизована конфігурація TypeScript для бекенд-пакетів, баз даних, CLI та бібліотек, які працюють виключно в середовищі Node.js ESM.

---

## 1. Канонічний `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "lib": ["esnext"],
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

- `module`: `"nodenext"` — вимагає явних розширень `.js` в імпортах відповідно до специфікації Node ESM.
- `moduleResolution`: `"nodenext"` — детермінована резолюція пакетів згідно з полем `exports` у `package.json`.
- `lib`: `["esnext"]` — виключає `dom`, що захищає бекенд від випадкового використання браузерних глобальних змінних (`window`, `document`).
- `declaration`: `true`, `emitDeclarationOnly`: `true`, `outDir`: `"./types"` — генерує компактні декларації `.d.ts` без перезапису JS-файлів.
