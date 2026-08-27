# Pipeline for Release v3.3.0: Media Indexing, Soft Subtitles & HF Vector Search

## 1. Run Release Spec Contract Tests
```bash
node --test releases/3/3/v3.3.0/task.spec.js
```

## 2. Run Full Verification Suite in share.app
```bash
pnpm --filter @nan0web/share.app release:spec
```
