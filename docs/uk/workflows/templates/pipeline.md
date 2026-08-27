# Pipeline for Release v1.0.0: Release Name

## 1. Fast-Fail Syntax Check
```bash
nan0ai check task.spec.js
```

## 2. Run Release Spec Contract Tests
```bash
node --test task.spec.js
```

## 3. Execute Release Task (Direct)
```bash
nan0ai task task.md --max-turns=30
```

## 4. Run Full Verification Suite in Web Package
```bash
pnpm --filter @my-scope/web run test
```
