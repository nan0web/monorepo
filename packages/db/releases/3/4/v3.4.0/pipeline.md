# Pipeline for Release v3.4.0: HydratedModel Integration in @nan0web/db

## 1. Fast-Fail Syntax Check
```bash
node --check releases/3/4/v3.4.0/task.spec.js
```

## 2. Run Release Spec Contract Tests
```bash
node --test releases/3/4/v3.4.0/task.spec.js
```

## 3. Run Package Verification Suite
```bash
pnpm --filter @nan0web/db run test
```
