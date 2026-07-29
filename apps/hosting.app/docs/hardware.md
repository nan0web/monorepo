Ні, запустити оригінальні моделі від **Anthropic** (серію Claude: Haiku, Sonnet, Opus) або **OpenAI** (GPT-4o, GPT-3.5) на власній чи орендованій відеокарті **неможливо**.

Ці моделі є **закритими (proprietary)**. Їхні ваги (weights) є комерційною таємницею, не викладені в публічний доступ, і доступ до них надається виключно через офіційні API відповідних компаній.

Натомість на орендованих GPU (зокрема Hugging Face Inference Endpoints) запускають **відкриті моделі (open-weight)**, такі як **Llama 3.1/3.3** від Meta, **Qwen 2.5** від Alibaba, **Gemma 2** від Google та **DeepSeek**. Багато з них за якістю вже наздогнали або навіть випередили комерційні закриті аналоги.

---

### **📊 Порівняльна таблиця моделей: Відкриті vs Закриті (2026)**

Нижче наведено класифікацію відкритих моделей, які ви можете запустити самостійно, та їхні найближчі комерційні аналоги.

| Клас моделі                                                               | Відкрита модель (Open-Weight)                              | Найближчий закритий аналог                                    | Необхідне залізо (GPU)                                             | Сумісність та продуктивність                                                                                            |
| :------------------------------------------------------------------------ | :--------------------------------------------------------- | :------------------------------------------------------------ | :----------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| **Lightweight** _(Швидкі, дешеві, для простих завдань)_                   | **Llama 3.1 8B**<br>**Gemma 2 9B**<br>**Qwen 2.5 14B**     | **Gemini 1.5 Flash**<br>**Claude 3 Haiku**<br>**GPT-4o-mini** | **1x RTX 4090** (24 ГБ) або **1x L4** (24 ГБ)                      | Дуже швидкі (100+ токенів/сек). Легко поміщаються в пам'ять навіть без сильної квантизації.                             |
| **Pro / Mid-range** _(Аналітика, кодинг, робота з текстом)_               | **Llama 3.3 70B**<br>**Qwen 2.5 72B**<br>**Mixtral 8x22B** | **Gemini 1.5 Pro**<br>**Claude 3.5 Sonnet**<br>**GPT-4o**     | **1x L40S** (48 ГБ, у FP8/AWQ)<br>**1x A100** або **H100** (80 ГБ) | Qwen 2.5 72B та Llama 3.3 70B зараз є "золотим стандартом" для розробки та агентів. На H100 видають відмінну швидкість. |
| **Frontier / Large** _(Максимальне розуміння, логіка, о1-подібні задачі)_ | **Llama 3.1 405B**<br>**DeepSeek-V3** (671B MoE)           | **Claude 3 Opus**<br>**GPT-4**<br>**Gemini 1.5 Ultra**        | **4x–8x H100** (80 ГБ)<br>або **4x–8x A100**                       | Потребують кластера відеокарт через гігантський розмір ваг. На рівні з найкращими закритими моделями.                   |

---

### **⚙️ Рівень сервісу та стабільності**

- **Комерційні API (OpenAI, Anthropic, Google):** Повністю керовані (serverless). Вони самі масштабують інфраструктуру, мають вбудований балансир навантаження і гео-резервування. Ви платите за кожен токен, але не думаєте про працездатність серверів.
- **Власний Endpoint (Hugging Face / RunPod):** Ви отримуєте виділену віртуальну машину. Якщо вона запущена (без авто-паузи), рівень сервісу високий і передбачуваний (стабільний ping, відсутність раптових блокувань лімітів запитів). Але ви самі відповідаєте за чергу запитів (якщо надіслати 1000 запитів одночасно без черги, сервер просто впаде з помилкою `Out of Memory` або перевантаженням HTTP-сервера).

---

### **⏱️ Проблема холодного старту на безкоштовних/дешевих тарифах**

Те, що ви спостерігаєте на безкоштовному тарифі Hugging Face (Spaces) — це класичний запуск на **CPU або слабкому спільному залізі**:

- Завантаження моделі розміром навіть 10–20 ГБ на повільний процесорний диск, а потім ініціалізація її в оперативній пам'яті (RAM) без апаратного прискорення тензорних ядер може тривати **10–15 хвилин**.
- На професійних GPU-ендпоінтах (AWS/GCP) диски та мережа значно швидші, тому холодний старт для моделей середнього розміру (до 70B) триває в середньому **3–5 хвилин**.

---

### **⚖️ Що вибрати для поодиноких запитів (Single Stream)?**

Якщо вам **не потрібно** обробляти мільйони токенів у пакетному режимі за один раз (Batch Processing), а потрібні періодичні запити в реальному часі (наприклад, для чат-бота або асистента розробника):

> [!IMPORTANT]
> **Оренда власного GPU (Hugging Face / RunPod) з увімкненим "Scale-to-Zero" у цьому випадку НЕ є вигідною.**
> Ви будете постійно чекати по 5 хвилин на холодний старт першого запиту, а потім платити за 15 хвилин простою GPU після кожного запиту.

#### **Найкраща альтернатива для поодиноких запитів:**

Замість оренди виділеного заліза використовуйте **Serverless-провайдери відкритих моделей**. Вони вже тримають запущені кластери GPU H100 та продають доступ до відкритих моделей (Llama 3.3 70B, Qwen 2.5 72B тощо) з оплатою за токени, без жодного холодного старту:

1. **DeepInfra / Fireworks AI / Together AI:**
   - Пропонують **Llama 3.3 70B** та **Qwen 2.5 72B**.
   - Ціна: **~$0.60 – $0.90 за 1 мільйон токенів** (це навіть дешевше за собівартість оренди GPU, оскільки вони розподіляють навантаження між тисячами клієнтів).
   - **Нікакого холодного старту** (відповідь миттєва).
2. **Groq:**
   - Пропонує моделі серії Llama на спеціальних LPU-процесорах.
   - Швидкість: **250–500 токенів на секунду** (найшвидший запуск у світі).
   - Ціна: також в межах ~$0.60/1M токенів.
3. **Google AI Studio (Gemini 1.5 Flash / Pro):**
   - Надає щедрі безкоштовні ліміти (Free Tier) для розробників з миттєвою відповіддю.

#### **Коли все ж варто орендувати GPU на Hugging Face?**

- Коли ви робите великий масив роботи за раз (наприклад, вам треба транскрибувати 1000 годин аудіо за допомогою Whisper або перекласти гігантську базу даних). Ви запускаєте GPU, завантажуєте його на 100% протягом години, отримуєте результат і одразу гасите інстанс.
- Коли вам потрібна абсолютна приватність (жоден токен не має виходити за межі вашого приватного контуру).
- Коли ви запускаєте специфічну власну модель (fine-tuned) або адаптер (LoRA), якого немає у публічних API.

## Актуальні моделі (2026-06-20)

| Модель                                             | Токени на $ | Провайдер                  | Тип   | In-token | Out-token | Виділений GPU | Shared GPU |
| -------------------------------------------------- | ----------- | -------------------------- | ----- | -------- | --------- | ------------- | ---------- |
| Qwen/Qwen3.5-9B                                    | 0t          | huggingface/deepinfra      | text  | $0.00    | $0.00     | +             | +          |
| qwen/qwen3.5-flash-02-23                           | 1Mt         | openrouter                 | text  | $0.07    | $0.26     | -             | -          |
| qwen/qwen3.5-plus-02-15                            | 1Mt         | openrouter                 | text  | $0.26    | $1.56     | -             | -          |
| qwen/qwen3.5-plus-20260420                         | 1Mt         | openrouter                 | text  | $0.30    | $1.80     | -             | -          |
| qwen/qwen3.6-27b                                   | 262Kt       | openrouter                 | text  | $0.29    | $3.17     | -             | -          |
| Qwen/Qwen3.6-27B                                   | 0t          | huggingface/featherless-ai | text  | $0.00    | $0.00     | -             | -          |
| Qwen/Qwen3.6-27B                                   | 0t          | huggingface/ovhcloud       | text  | $0.00    | $0.00     | +             | +          |
| Qwen/Qwen3.6-27B                                   | 0t          | huggingface/deepinfra      | text  | $0.00    | $0.00     | +             | +          |
| qwen/qwen3.6-35b-a3b                               | 262Kt       | openrouter                 | text  | $0.14    | $1.00     | -             | -          |
| Qwen/Qwen3.6-35B-A3B                               | 0t          | huggingface/featherless-ai | text  | $0.00    | $0.00     | -             | -          |
| Qwen/Qwen3.6-35B-A3B                               | 262Kt       | huggingface/deepinfra      | text  | $0.15    | $0.95     | +             | +          |
| qwen/qwen3.6-flash                                 | 1Mt         | openrouter                 | text  | $0.19    | $1.13     | -             | -          |
| qwen/qwen3.6-max-preview                           | 262Kt       | openrouter                 | text  | $1.04    | $6.24     | -             | -          |
| qwen/qwen3.6-plus                                  | 1Mt         | openrouter                 | text  | $0.33    | $1.95     | -             | -          |
| qwen/qwen3.7-max                                   | 1Mt         | openrouter                 | text  | $1.25    | $3.75     | -             | -          |
| qwen/qwen3.7-plus                                  | 1Mt         | openrouter                 | text  | $0.32    | $1.28     | -             | -          |
| Qwen/Qwen3.5-27B                                   | 0t          | huggingface/featherless-ai | text  | $0.00    | $0.00     | -             | -          |
| Qwen/Qwen3.5-27B                                   | 0t          | huggingface/deepinfra      | text  | $0.00    | $0.00     | +             | +          |
| qwen/qwen3.5-35b-a3b                               | 262Kt       | openrouter                 | text  | $0.14    | $1.00     | -             | -          |
| Qwen/Qwen3.5-35B-A3B                               | 262Kt       | huggingface/novita         | text  | $0.25    | $2.00     | +             | -          |
| Qwen/Qwen3.5-35B-A3B                               | 0t          | huggingface/deepinfra      | text  | $0.00    | $0.00     | +             | +          |
| qwen/qwen3.5-397b-a17b                             | 256Kt       | openrouter                 | text  | $0.39    | $2.45     | -             | -          |
| Qwen/Qwen3.5-397B-A17B                             | 262Kt       | huggingface/novita         | text  | $0.60    | $3.60     | +             | -          |
| Qwen/Qwen3.5-397B-A17B                             | 262Kt       | huggingface/together       | text  | $0.60    | $3.60     | +             | +          |
| Qwen/Qwen3.5-397B-A17B                             | 0t          | huggingface/featherless-ai | text  | $0.00    | $0.00     | -             | -          |
| Qwen/Qwen3.5-397B-A17B                             | 262Kt       | huggingface/deepinfra      | text  | $0.49    | $3.60     | +             | +          |
| Qwen/Qwen3.5-397B-A17B                             | 262Kt       | huggingface/ovhcloud       | text  | $0.71    | $4.25     | +             | -          |
| Qwen/Qwen3.5-397B-A17B                             | 0t          | huggingface/scaleway       | text  | $0.00    | $0.00     | +             | -          |
| qwen/qwen3.5-9b                                    | 262Kt       | openrouter                 | text  | $0.10    | $0.15     | -             | -          |
| Qwen/Qwen3.5-9B                                    | 262Kt       | huggingface/together       | text  | $0.17    | $0.25     | +             | +          |
| Qwen/Qwen3.5-9B                                    | 0t          | huggingface/featherless-ai | text  | $0.00    | $0.00     | -             | -          |
| Qwen/Qwen3.5-9B                                    | 262Kt       | huggingface/ovhcloud       | text  | $0.12    | $0.18     | +             | +          |
| google/gemma-4-26b-a4b-it                          | 262Kt       | openrouter                 | image | $0.06    | $0.33     | -             | -          |
| google/gemma-4-26B-A4B-it                          | 262Kt       | huggingface/novita         | text  | $0.13    | $0.40     | +             | -          |
| google/gemma-4-26B-A4B-it                          | 0t          | huggingface/featherless-ai | text  | $0.00    | $0.00     | -             | -          |
| google/gemma-4-26B-A4B-it                          | 262Kt       | huggingface/deepinfra      | text  | $0.07    | $0.34     | +             | +          |
| google/gemma-4-26b-a4b-it:free                     | 262Kt       | openrouter                 | image | $0.00    | $0.00     | -             | -          |
| google/gemma-4-31b-it                              | 262Kt       | openrouter                 | image | $0.12    | $0.35     | -             | -          |
| google/gemma-4-31B-it                              | 262Kt       | huggingface/novita         | text  | $0.14    | $0.40     | +             | +          |
| google/gemma-4-31B-it                              | 262Kt       | huggingface/together       | text  | $0.39    | $0.97     | -             | +          |
| google/gemma-4-31B-it                              | 0t          | huggingface/featherless-ai | text  | $0.00    | $0.00     | -             | -          |
| google/gemma-4-31B-it                              | 262Kt       | huggingface/deepinfra      | text  | $0.13    | $0.38     | +             | +          |
| google/gemma-4-31b-it:free                         | 262Kt       | openrouter                 | image | $0.00    | $0.00     | -             | -          |
| pearl-ai/Gemma-4-31B-it-pearl                      | 262Kt       | huggingface/together       | text  | $0.28    | $0.86     | +             | -          |
| ~anthropic/claude-opus-latest                      | 1Mt         | openrouter                 | text  | $5.00    | $25.00    | -             | -          |
| anthropic/claude-opus-4                            | 200Kt       | openrouter                 | image | $15.00   | $75.00    | -             | -          |
| anthropic/claude-opus-4.1                          | 200Kt       | openrouter                 | image | $15.00   | $75.00    | -             | -          |
| anthropic/claude-opus-4.5                          | 200Kt       | openrouter                 | file  | $5.00    | $25.00    | -             | -          |
| anthropic/claude-opus-4.6                          | 1Mt         | openrouter                 | text  | $5.00    | $25.00    | -             | -          |
| anthropic/claude-opus-4.6-fast                     | 1Mt         | openrouter                 | text  | $30.00   | $150.00   | -             | -          |
| anthropic/claude-opus-4.7                          | 1Mt         | openrouter                 | text  | $5.00    | $25.00    | -             | -          |
| anthropic/claude-opus-4.7-fast                     | 1Mt         | openrouter                 | text  | $30.00   | $150.00   | -             | -          |
| anthropic/claude-opus-4.8                          | 1Mt         | openrouter                 | text  | $5.00    | $25.00    | -             | -          |
| anthropic/claude-opus-4.8-fast                     | 1Mt         | openrouter                 | text  | $10.00   | $50.00    | -             | -          |
| google/gemini-3-flash-preview                      | 1Mt         | openrouter                 | text  | $0.50    | $3.00     | -             | -          |
| google/gemini-3-pro-image                          | 66Kt        | openrouter                 | image | $2.00    | $12.00    | -             | -          |
| google/gemini-3-pro-image-preview                  | 66Kt        | openrouter                 | image | $2.00    | $12.00    | -             | -          |
| google/gemini-3.1-flash-image                      | 131Kt       | openrouter                 | image | $0.50    | $3.00     | -             | -          |
| google/gemini-3.1-flash-image-preview              | 131Kt       | openrouter                 | image | $0.50    | $3.00     | -             | -          |
| google/gemini-3.1-flash-lite                       | 1Mt         | openrouter                 | text  | $0.25    | $1.50     | -             | -          |
| google/gemini-3.1-flash-lite-preview               | 1Mt         | openrouter                 | text  | $0.25    | $1.50     | -             | -          |
| google/gemini-3.1-pro-preview                      | 1Mt         | openrouter                 | audio | $2.00    | $12.00    | -             | -          |
| google/gemini-3.1-pro-preview-customtools          | 1Mt         | openrouter                 | text  | $2.00    | $12.00    | -             | -          |
| google/gemini-3.5-flash                            | 1Mt         | openrouter                 | text  | $1.50    | $9.00     | -             | -          |
| nvidia/llama-3.3-nemotron-super-49b-v1.5           | 131Kt       | openrouter                 | text  | $0.40    | $0.40     | -             | -          |
| nvidia/nemotron-3-nano-30b-a3b                     | 262Kt       | openrouter                 | text  | $0.05    | $0.20     | -             | -          |
| nvidia/nemotron-3-nano-30b-a3b:free                | 256Kt       | openrouter                 | text  | $0.00    | $0.00     | -             | -          |
| nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free | 256Kt       | openrouter                 | text  | $0.00    | $0.00     | -             | -          |
| nvidia/nemotron-3-super-120b-a12b                  | 1Mt         | openrouter                 | text  | $0.09    | $0.45     | -             | -          |
| nvidia/nemotron-3-super-120b-a12b:free             | 1Mt         | openrouter                 | text  | $0.00    | $0.00     | -             | -          |
| nvidia/nemotron-3-ultra-550b-a55b                  | 1Mt         | openrouter                 | text  | $0.50    | $2.20     | -             | -          |
| nvidia/nemotron-3-ultra-550b-a55b:free             | 1Mt         | openrouter                 | text  | $0.00    | $0.00     | -             | -          |
| nvidia/nemotron-3.5-content-safety:free            | 128Kt       | openrouter                 | text  | $0.00    | $0.00     | -             | -          |
| nvidia/nemotron-nano-12b-v2-vl:free                | 128Kt       | openrouter                 | image | $0.00    | $0.00     | -             | -          |
| nvidia/nemotron-nano-9b-v2:free                    | 128Kt       | openrouter                 | text  | $0.00    | $0.00     | -             | -          |
| nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16      | 0t          | huggingface/deepinfra      | text  | $0.00    | $0.00     | +             | +          |
| nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-NVFP4     | 512Kt       | huggingface/together       | text  | $0.60    | $3.60     | +             | +          |
| nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-NVFP4     | 0t          | huggingface/fireworks-ai   | text  | $0.00    | $0.00     | +             | -          |
| x-ai/grok-4.20                                     | 2Mt         | openrouter                 | text  | $1.25    | $2.50     | -             | -          |
| x-ai/grok-4.20-multi-agent                         | 2Mt         | openrouter                 | text  | $1.25    | $2.50     | -             | -          |
| x-ai/grok-4.3                                      | 1Mt         | openrouter                 | text  | $1.25    | $2.50     | -             | -          |
| x-ai/grok-build-0.1                                | 256Kt       | openrouter                 | text  | $1.00    | $2.00     | -             | -          |
| mistralai/mistral-large                            | 128Kt       | openrouter                 | text  | $2.00    | $6.00     | -             | -          |
| mistralai/mistral-large-2407                       | 131Kt       | openrouter                 | text  | $2.00    | $6.00     | -             | -          |
| mistralai/mistral-large-2512                       | 262Kt       | openrouter                 | text  | $0.50    | $1.50     | -             | -          |
| mistralai/mistral-medium-3                         | 131Kt       | openrouter                 | text  | $0.40    | $2.00     | -             | -          |
| mistralai/mistral-medium-3-5                       | 262Kt       | openrouter                 | text  | $1.50    | $7.50     | -             | -          |
| mistralai/mistral-medium-3.1                       | 131Kt       | openrouter                 | text  | $0.40    | $2.00     | -             | -          |
| mistralai/mistral-nemo                             | 131Kt       | openrouter                 | text  | $0.02    | $0.03     | -             | -          |
| mistralai/mistral-saba                             | 33Kt        | openrouter                 | text  | $0.20    | $0.60     | -             | -          |
| mistralai/mistral-small-24b-instruct-2501          | 33Kt        | openrouter                 | text  | $0.05    | $0.08     | -             | -          |
| mistralai/mistral-small-2603                       | 262Kt       | openrouter                 | text  | $0.15    | $0.60     | -             | -          |
| mistralai/mistral-small-3.1-24b-instruct           | 128Kt       | openrouter                 | text  | $0.35    | $0.55     | -             | -          |
| mistralai/mistral-small-3.2-24b-instruct           | 128Kt       | openrouter                 | image | $0.08    | $0.20     | -             | -          |
| mistralai/mixtral-8x22b-instruct                   | 66Kt        | openrouter                 | text  | $2.00    | $6.00     | -             | -          |
| mistralai/voxtral-small-24b-2507                   | 32Kt        | openrouter                 | text  | $0.10    | $0.30     | -             | -          |
| deepseek-ai/DeepSeek-V4-Flash                      | 1Mt         | huggingface/novita         | text  | $0.14    | $0.28     | +             | -          |
| deepseek-ai/DeepSeek-V4-Flash                      | 0t          | huggingface/fireworks-ai   | text  | $0.00    | $0.00     | +             | -          |
| deepseek-ai/DeepSeek-V4-Flash                      | 0t          | huggingface/featherless-ai | text  | $0.00    | $0.00     | -             | -          |
| deepseek-ai/DeepSeek-V4-Flash                      | 1Mt         | huggingface/deepinfra      | text  | $0.14    | $0.28     | +             | +          |
| deepseek-ai/DeepSeek-V4-Pro                        | 1Mt         | huggingface/novita         | text  | $1.60    | $3.38     | +             | -          |
| deepseek-ai/DeepSeek-V4-Pro                        | 512Kt       | huggingface/together       | text  | $1.74    | $3.48     | +             | +          |
| deepseek-ai/DeepSeek-V4-Pro                        | 1Mt         | huggingface/fireworks-ai   | text  | $0.00    | $0.00     | +             | -          |
| deepseek-ai/DeepSeek-V4-Pro                        | 0t          | huggingface/featherless-ai | text  | $0.00    | $0.00     | -             | -          |
| deepseek-ai/DeepSeek-V4-Pro                        | 66Kt        | huggingface/deepinfra      | text  | $1.74    | $3.48     | +             | +          |
| zai-org/GLM-5.1                                    | 203Kt       | huggingface/together       | text  | $1.40    | $4.40     | +             | +          |
| zai-org/GLM-5.1                                    | 203Kt       | huggingface/fireworks-ai   | text  | $0.00    | $0.00     | +             | -          |
| zai-org/GLM-5.1                                    | 0t          | huggingface/featherless-ai | text  | $0.00    | $0.00     | -             | -          |
| zai-org/GLM-5.1                                    | 203Kt       | huggingface/deepinfra      | text  | $1.05    | $3.50     | +             | +          |
| zai-org/GLM-5.1                                    | 0t          | huggingface/zai-org        | text  | $0.00    | $0.00     | +             | -          |
| zai-org/GLM-5.1-FP8                                | 203Kt       | huggingface/fireworks-ai   | text  | $0.00    | $0.00     | +             | -          |
| zai-org/GLM-5.1-FP8                                | 0t          | huggingface/zai-org        | text  | $0.00    | $0.00     | -             | -          |
| zai-org/GLM-5.2                                    | 0t          | huggingface/novita         | text  | $0.00    | $0.00     | +             | +          |
| zai-org/GLM-5.2                                    | 262Kt       | huggingface/together       | text  | $1.40    | $4.40     | +             | +          |
| zai-org/GLM-5.2                                    | 0t          | huggingface/fireworks-ai   | text  | $0.00    | $0.00     | +             | -          |
| zai-org/GLM-5.2                                    | 0t          | huggingface/featherless-ai | text  | $0.00    | $0.00     | -             | -          |
| zai-org/GLM-5.2                                    | 0t          | huggingface/deepinfra      | text  | $0.00    | $0.00     | +             | +          |
| zai-org/GLM-5.2                                    | 0t          | huggingface/zai-org        | text  | $0.00    | $0.00     | +             | -          |
| zai-org/GLM-5.2-FP8                                | 0t          | huggingface/zai-org        | text  | $0.00    | $0.00     | -             | -          |

## Порівняльний аналіз швидкості та вартості (Червень 2026)

### 1. Результати швидкісного тестування (OpenRouter)

Тестовий промпт: _"Explain the difference between a synchronous and asynchronous function in JavaScript in 3 short sentences."_

| Модель                    | Час до 1-го токена (TTFT) | Швидкість (TPS)           | Загальний час   | Кількість токенів | Вартість за 1М (In/Out) |
| :------------------------ | :------------------------ | :------------------------ | :-------------- | :---------------- | :---------------------- |
| **Qwen 3.6 Flash**        | 4.35 сек                  | **1883.6 токенів/сек** 🔥 | 4.79 сек        | 825               | $0.1875 / $1.125        |
| **DeepSeek V4 Pro**       | 8.18 сек ⏳               | **409.3 токенів/сек** 🚀  | 9.31 сек        | 465               | $0.4350 / $0.870        |
| **Gemini 3.1 Flash Lite** | 1.43 сек                  | **350.5 токенів/сек**     | 1.64 сек        | 75                | $0.2500 / $1.500        |
| **Gemma 4 31B (Google)**  | **0.38 - 0.40 сек** ⚡    | **167.0 токенів/сек**     | 0.85 сек        | 78                | $0.1200 / $0.350        |
| **DeepSeek V4 Flash**     | 2.01 сек                  | **31.3 токенів/сек**      | 3.80 - 4.10 сек | 56                | **$0.0900 / $0.180** 💎 |

### 2. Аналіз комерційного тарифу Cerebras (Developer Tier)

Для високопродуктивних інтеграцій (швидкість до 100х відносно звичайних хмарних GPU):

| Модель             | Розмір контексту    | Швидкість генерації      | Вартість Input (за 1M) | Вартість Output (за 1M) |
| :----------------- | :------------------ | :----------------------- | :--------------------- | :---------------------- |
| **`gpt-oss-120b`** | **128K** токенів 🔥 | **~3000 токенів/сек** 🚀 | **$0.35**              | **$0.75**               |
| **`zai-glm-4.7`**  | **128K** токенів    | **~1000 токенів/сек**    | $2.25                  | $2.75                   |

### 3. Рекомендації щодо вибору

- **Для інтерактивного чату/UI:** **Gemma 4 31B** (миттєвий старт 388 мс та низька ціна).
- **Для важких фонових завдань / парсингу:** **DeepSeek V4 Flash** (найнижча ціна $0.09 / $0.18 на ринку).
- **Для складної логіки та кодування:** **DeepSeek V4 Pro** ($0.435 / $0.87) або **gpt-oss-120b** на Cerebras (3000 токенів/сек та ціна $0.35 / $0.75).

### 4. Бюджетна стратегія (Безкоштовно та мікро-бюджет)

- **Абсолютний нуль ($0.00) — для тестів та особистого використання:**
  - **Cerebras Free Tier:** `gpt-oss-120b` або `zai-glm-4.7` (1 000 000 безкоштовних токенів на добу, ліміт 5 запитів/хв). Ідеально для важких задач без витрат.
  - **OpenRouter Free Models:** `google/gemma-4-31b-it:free` або `google/gemma-4-26b-a4b-it:free`. Безкоштовний безлімітний інференс моделей середнього класу.
- **Мікро-бюджет — для масштабної промислової обробки:**
  - **DeepSeek V4 Flash** ($0.09 вхідні / $0.18 вихідні за 1M токенів) — найвигідніший варіант для фонового опрацювання великих обсягів тексту.
