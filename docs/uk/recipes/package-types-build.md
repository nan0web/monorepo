---
description: Канонічний рецепт налаштування TypeScript декларацій, subpath exports та конвеєру тестів/збірки для пакетів
---

# 📦 Рецепт: Package Types, Exports & Test-First Build

> **Призначення:** Стандартизація генерації TypeScript декларацій (`types/`), правильних мапінгів у `package.json` (`exports`, `types`, `files`) та забезпечення правила **"спочатку test, потім build"**.

> 💡 **Живий верифікований тест рецепту:** [`docs/uk/recipes/package-types-build.test.js`](package-types-build.test.js)  
> Запуск найкоротшого шляху (Shortest Path):  
> `node docs/uk/recipes/package-types-build.test.js`

---

## 1. Конфігурація `package.json`

### Правило порядку конвеєру:
> ⚠️ **Test-First Build:** Конвеєр `test:all` **завжди** спочатку запускає тести (`test`), а вже потім збірку типів (`build`). Не можна збирати артефакти, якщо тести падають.

```json
{
  "name": "@nan0web/my-package",
  "version": "1.0.0",
  "type": "module",
  "main": "./src/index.js",
  "types": "./types/index.d.ts",
  "files": [
    "src/**/*.js",
    "src/**/*.ts",
    "src/**/*.tsx",
    "!src/**/*.spec.js",
    "!src/**/*.spec.tsx",
    "!src/**/*.test.js",
    "types/**/*.d.ts"
  ],
  "exports": {
    ".": {
      "types": "./types/index.d.ts",
      "import": "./src/index.js"
    },
    "./feature/*": {
      "types": "./types/feature/*.d.ts",
      "import": "./src/feature/*.js"
    }
  },
  "scripts": {
    "prebuild": "rm -rf types/",
    "build": "tsc",
    "test": "node --test \"src/**/*.test.js\"",
    "test:release": "node --test \"src/test/releases/**/*.test.js\"",
    "release:spec": "node --test \"releases/**/*.spec.js\"",
    "test:all": "npm run test && npm run build && npm run test:release"
  }
}
```

---

## 2. Конфігурація `tsconfig.json`

Для пакетів, які пишуться на JS з JSDoc або TSX, налаштовується генерація `.d.ts` у папку `./types`:

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "nodenext",
    "lib": ["esnext", "dom"],
    "declaration": true,
    "declarationMap": false,
    "emitDeclarationOnly": true,
    "outDir": "./types",
    "rootDir": "./src",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "nodenext",
    "allowSyntheticDefaultImports": true,
    "noImplicitAny": false,
    "allowJs": true,
    "checkJs": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "src/test", "**/*.spec.js", "**/*.spec.tsx", "**/*.test.js"]
}
```

---

## 3. Чекліст сумісності з Next.js App Router & Bundler

1. **Subpath Exports:** Кожен підшлях у `"exports"` зобов'язаний мати як `"types"`, так і `"import"`.
2. **Explicit Extensions:** Імпорти у вихідному коді та в exports повинні містити явні розширення (`.js` або `.d.ts`).
3. **Clean Prebuild:** Скрипт `prebuild` завжди очищає застарілі типи (`rm -rf types/`), щоб видалені файли не залишалися в пакеті.
4. **Контрактні тести:** Кожен новий subpath покривається тестом у `releases/{major}/{minor}/vX.Y.Z/task.spec.js`.
