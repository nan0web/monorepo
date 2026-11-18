---
version: 3.5.0
type: minor
status: active
locale: uk
models: ['ModelProvider', 'AI']
---

# 🚀 Mission: Інтеграція Hetzner AI Inference Provider (v3.5.0)

## 🏁 Overview (Огляд)
Інтеграція провайдера Hetzner AI Inference (`https://inference.hetzner.com/api/v1`) на базі OpenAI-сумісного стандарту в ядро `@nan0web/ai`. Забезпечення автоматичного розпізнавання моделей `Qwen/Qwen3.6-35B-A3B-FP8` та `meta-llama/Llama-3.3-70B-Instruct`, валідації токена `HETZNER_API_TOKEN`, та підтримки в `streamText` / `generateText`.

## 👥 User Stories (Сценарії)
- **US-1 (Провайдер Hetzner):** Як розробник, я можу використовувати моделі Hetzner Inference, вказавши `provider: 'hetzner'` та відповідний `modelId`.
- **US-2 (Валідація токена):** Як користувач, якщо змінна `HETZNER_API_TOKEN` (або `HETZNER_API_KEY`) відсутня, я отримую інформативну помилку `ModelError` з інструкцією, як згенерувати токен на `experiments.hetzner.com`.
- **US-3 (Безкоштовний каталог):** Як архітектор, моделі Hetzner з нульовою вартістю коректно ранжуються у `AiStrategy` (`finance: 'free'`).

## 🎯 Target Files
- `packages/ai/src/providers/hetzner.info.js`
- `packages/ai/src/domain/ModelProvider.js`
- `packages/ai/src/domain/AI.js`
- `packages/ai/src/domain/HetznerProvider.story.js`
- `packages/ai/releases/3/5/v3.5.0/task.spec.js`

## 📋 Завдання (Tasks)
- [x] [task-1] Створити `src/providers/hetzner.info.js` з каталогом моделей (`Qwen/Qwen3.6-35B-A3B-FP8`, `meta-llama/Llama-3.3-70B-Instruct`) та методом `makeFlat`.
- [x] [task-2] Зареєструвати `'hetzner'` у `ModelProvider.AvailableProviders`, додати перевірку `hasApiKey`, валідацію `validateApiKey` та оновити `fetchFromProvider`.
- [x] [task-3] Підключити OpenAI-сумісний драйвер Hetzner у `AI.prototype.getProvider`.
- [x] [task-4] Написати сценарний тест `src/domain/HetznerProvider.story.js` (100% pass).
- [x] [task-5] Створити контрактний тест `releases/3/5/v3.5.0/task.spec.js` та перевірити через `dilo validate`.

## ⚖️ Критерії Прийнятності (Acceptance Criteria)
1. `ModelProvider.AvailableProviders` містить `'hetzner'`.
2. `ModelProvider.validateApiKey('hetzner')` кидає `ModelError` при відсутності ключа і проходить при його наявності.
3. `HetznerInfo.makeFlat` повертає екземпляри `ModelInfo` з провайдером `hetzner`.
4. `AI.prototype.getProvider('hetzner')` повертає фабрику моделей `@ai-sdk/openai` із `baseURL: 'https://inference.hetzner.com/api/v1'`.
5. Усі тести пакету `@nan0web/ai` (`test`, `test:stories`, `test:docs`, `build`, `knip`) проходять на 100% без помилок.
