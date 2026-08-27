# Pipeline for Release v3.3.0: TaskIntent & Clean Pipeline Runner

## 1. Fast-Fail Syntax Check
```bash
pnpm nan0ai check releases/3/3/v3.3.0/task.spec.js
```

## 2. Run Release Spec Contract Tests
```bash
node --test releases/3/3/v3.3.0/task.spec.js
```

## 3. Run Scenario Tests
```bash
pnpm --filter @nan0web/ai run test:stories
```

## 4. Run Full AI Package Tests
```bash
pnpm --filter @nan0web/ai run test
```
