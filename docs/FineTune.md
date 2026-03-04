# Fine-Tune Models for @nan0web

This guide outlines the workflow for fine-tuning LLMs (specifically Qwen3 using MLX) to understand the @nan0web platform's architecture, coding standards (Java•Script, JSDoc, node:test), and release processes.

## Learning Algorithms: Direct vs. Incremental

We distinguish between two approaches to knowledge accumulation.

### 1. Incremental Learning (Recommended for Daily Releases)

In this approach, the model evolves continuously. Each new day of training builds upon the previously trained and fused model. This avoids re-training the entire history from scratch every time.

The generated datasets MUST BE incremental as well. To get such for nan0web packages and apps it is possible to switch between version tags and generate different versions datasets `pnpm test:docs`. To get the delta between versions diff of `jsonl` can be used.

**Logic Implementation:**

```javascript
class Learning {
  model
  constructor(options = {}) {
    const { name, model = 'GetSoloTech/Qwen3-Code-Reasoning-4B' } = options
    this.name = String(name)
    this.model = String(model)
  }
  async learn(datasets = [], baseModel = this.model) {
    const recent = datasets[datasets.length - 1]
    if (!recent) return false
    // Learn based on baseModel
    this.output = baseModel + '-' + this.name + '.' + recent.date
    // Save new model
    return this.output
  }
}

class IncrementalLearning extends Learning {
  async learn(datasets = [], baseModel = this.model) {
    await super.learn(datasets, baseModel)
    // Update the current model to be the newly fused model for the next iteration
    this.model = this.output
  }
}

const sets = [
  { date: '2026-01-20', content: '...' },
  { date: '2026-01-21', content: '...' },
  { date: '2026-01-22', content: '...' },
]

const dir = new Learning({ name: 'nan0web' })
const inc = new IncrementalLearning({ name: 'nan0web-inc' })
const prevs = []
for (const entry of sets) {
  // Each step (day) learns the whole delta between basic model and current day
  await dir.learn([...prevs, entry])
  // Each step learns only the new 'entry' but builds on top of 'this.model'
  await inc.learn([entry])
  prevs.push(entry)
}
```

**CLI Workflow Execution:**

1. **Day 1:** Train on base model, fuse adapter, save as Model v0.0.1.
2. **Day 2:** Use `Model v0.0.1` as the `--model` input for training. Fuse adapter, save as Model v0.0.2.
3. **Day N:** Repeat.

_Note: While technically only the "delta" is trained on specific new data to save time, care must be taken with the learning rate to avoid catastrophic forgetting of previous "base" knowledge._

---

## 🚀 Quickstart (Mac/M1)

### 1. Prepare Dataset

Generate the training data from your monorepo packages.

```bash
node bin/fine-tune.js
# Creates .datasets/train.jsonl
```

### 2. Fine-Tune (Day 1)

Run the training script against the base model.

```bash
bash bin/fine-tune.sh \
  --model GetSoloTech/Qwen3-Code-Reasoning-4B \
  --data .datasets/train.jsonl \
  --iters 100 \
  --adapter-path adapters_day1.npz
```

### 3. Merge/Fuse (Day 1)

Create a standalone MLX model directory from the adapter.

```bash
bash bin/merge-adapter.sh \
  --adapter adapters_day1.npz \
  --output models/v0.0.1
```

### 4. Fine-Tune (Day 2 - Incremental)

**Pass the previously fused `v0.0.1` as the model.**

```bash
bash bin/fine-tune.sh \
  --model models/v0.0.1 \
  --data .datasets/train_day2.jsonl \
  --iters 100 \
  --adapter-path adapters_day2.npz
```

### 5. Merge/Fuse (Day 2)

```bash
bash bin/merge-adapter.sh \
  --adapter adapters_day2.npz \
  --output models/v0.0.2
```

---

## 🔧 Deployment: MLX Server

For integration with JavaScript (Node/Deno/Bun), use the OpenAI-compatible MLX Server. This avoids the need for GGUF conversion on Mac.

### Start Server

The server accepts the fused model directory.

```bash
bash bin/run-server.sh models/v0.0.2
```

**Custom Configuration:**

```bash
bash bin/run-server.sh \
  --model models/v0.0.2 \
  --host 0.0.0.0 \
  --port 3000
```

The server starts an OpenAI-like API at `http://localhost:3000/v1`.

### Integration with `ai-sdk` (Vercel)

Here is how to connect your Node.js application to the local MLX server.

Check [/play/test-ai-sdk.js](/play/test-ai-sdk.js) for understanding or run it:

```bash
node play/test-ai-sdk.js
```

```javascript
// play/test-ai-sdk.mjs
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'

const mlx = createOpenAI({
  baseURL: 'http://localhost:8080/v1', // Default run-server.sh port
  apiKey: 'not-required',
})

async function askModel(query) {
  const { text } = await generateText({
    model: mlx('mlx-model'), // model string is largely ignored by local server, but required
    messages: [
      {
        role: 'system',
        content:
          'You are a Psycho-social Architect. Use @nan0web standards: JS, JSDoc, node:test. Be concise.',
      },
      {
        role: 'user',
        content: query,
      },
    ],
    maxTokens: 512,
  })
  return text
}

console.log(await askModel('Write a test for @nan0web/db'))
```

---

## 📊 Notes on Behavior

### Short Responses / System Prompts

If responses are too short or unrelated:

1. Ensure you are passing a `system` message via the API (as shown above).
2. Increase `maxTokens` in the generation config.
3. Check the training dataset variety—if the dataset only has short answers, the model will emulate that.

### Incremental Learning Stability

- **Memory:** Fused models take up space (~7.5GB each). Use `bin/cleanup-temp.sh` or prune old versions carefully.
- **Overfitting:** If training on small datasets (e.g., one day), keep learning rates low (e.g., `1e-5` or lower) and iterations low (50-100).

### Model Selection

We recommend **Qwen3 Code Reasoning 4B** for balanced speed and capability on M1/M2.
