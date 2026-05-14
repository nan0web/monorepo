# 🧠 AI LLiMo Strategy (AI Strategy Plan) - Detailed version

Based on the analysis of the `@nan0web/ai` and `@nan0web/llimo` packages, we have developed a plan to improve intelligent model selection.

## 1. Current State Analysis
We found the `AiStrategy` class in the `ai` package (src/domain/AI.js) and locally in `llimo.app`. It already supports basic parameters:
- **Finance:** `free`, `cheap`, `expensive`.
- **Speed:** `slow`, `fast`.
- **Volume:** `low`, `mid`, `high` (model parameter count).
- **Level:** `simple`, `smart`, `expert` (based on success statistics).

## 2. Expansion and Optimization Plan

### A. Measurement and Reputation (Real-time Stats)
- **Speed (Performance):** Implement `tokens/sec` measurement during generation. This will allow the `speed: fast` strategy to actually choose the fastest model based on the user's recent requests.
- **Quality (Quality Audit):** Integrate automatic response validation. If a model generates syntactically incorrect code (broken JS/YAML), this automatically lowers its `reputation score`.

### B. Dynamic Switching (Self-Correction Loop)
- **Fallback Logic:** If the current model (e.g., "cheap/fast") returns a validation error, the system automatically switches to the "expert" model to correct the step.
- **Yaml Strategy:** The ability to set the strategy directly in task MD files:
  ```yaml
  strategy:
    finance: cheap
    level: expert
  ```

### C. Global Statistics (Home DB)
- **Centralized Storage:** All logs are stored in `~/.llimo/chats/`.
- **Cost Analysis:** The global `index.csv` file allows you to see total costs and efficiency for each provider (Groq, Gemini, DeepSeek).

## 3. Implementation Steps (Action Items)

1. **Modernization of `Usage.js` and `AI.js`:** Add fields for latency and speed.
2. **Update `chatProgress.js`:** Display live speed statistics and remaining free limits (RPD/TPD).
3. **Implementation of `QualityGate.js`:** A validator script for generated code (eslint-lite / syntax check).
4. **Integration into `WorkflowRunner`:** Automatic use of "Expert" models when "broken" files are detected.

---
*The plan is developed according to the principles of Zero-Hallucination and OLMUI.*