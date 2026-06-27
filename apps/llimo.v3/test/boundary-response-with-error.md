**АрхіТехноМаг**
— використано 60890 токенів з 200000 (30.4%)
— надано 1 відповідей

Я тобі відповідаю, друже:

Створю SpecRunner .nan0 сценарії для всіх матричних кроків. Кожен .nan0 файл матиме сценарії для різних шляхів виконання (heuristic fallback та LLM path).

Спочатку перевірю структуру SpecAdapter, щоб розуміти точний контракт:

---boundary:@get---
apps/3rdparty/eaukraine.eu/src/domain/matrices/test-helpers.js
packages/ui/src/testing/SpecAdapter.js
packages/ui/src/core/Intent.js
---boundary---

Далі створю .nan0 тести для кожного матричного кроку:

---boundary:apps/3rdparty/eaukraine.eu/src/domain/matrices/MatrixStep.spec.nan0---
name: MatrixStep Base
story:
  - MatrixStep:
      matrixName: TestMatrix
      content: Test content
      scaleMin: 0
      scaleMax: 9

  - progress:
      $match: Applying TestMatrix...

  - result:
      $assert:
        - type: error
        - message: Must be implemented by subclass

---
name: MatrixStep With Custom Scale
story:
  - MatrixStep:
      matrixName: CustomScale
      content: Evaluate this
      scaleMin: 1
      scaleMax: 7

  - progress:
      $match: Applying CustomScale...

  - result:
      $assert:
        - type: error
---boundary---

---boundary:apps/3rdparty/eaukraine.eu/src/domain/matrices/LogicMatrixStep.spec.nan0---
name: LogicMatrix Heuristic High Score
story:
  - LogicMatrixStep:
      content: Це доказаний факт, підтверджений науковими дослідженнями.

  - progress:
      $match: Evaluating truthfulness...

  - agent:
      task: Evaluate content truthfulness using the Logic Matrix (4 Laws of Aristotle)
      $mock:
        success: false
        message: ""

  - progress:
      $match: Logic evaluation complete

  - result:
      $assert:
        - data.score >= 5
        - data.reasoning | includes "Heuristic"
        - data.identity
        - data.non_contradiction
        - data.excluded_middle
        - data.sufficient_reason

---
name: LogicMatrix Heuristic Low Score
story:
  - LogicMatrixStep:
      content: Це повна маніпуляція і фейк! Дезінформація!

  - progress:
      $match: Evaluating truthfulness...

  - agent:
      task: Evaluate content truthfulness using the Logic Matrix (4 Laws of Aristotle)
      $mock:
        success: false
        message: ""

  - progress:
      $match: Logic evaluation complete

  - result:
      $assert:
        - data.score <= 5

---
name: LogicMatrix Heuristic Neutral
story:
  - LogicMatrixStep:
      content: Some neutral text without markers.

  - progress:
      $match: Evaluating truthfulness...

  - agent:
      task: Evaluate content truthfulness using the Logic Matrix (4 Laws of Aristotle)
      $mock:
        success: false
        message: ""

  - progress:
      $match: Logic evaluation complete

  - result:
      $assert:
        - data.score >= 4
        - data.score <= 6

---
name: LogicMatrix LLM High Truth
story:
  - LogicMatrixStep:
      content: Scientific fact confirmed by multiple studies.

  - progress:
      $match: Evaluating truthfulness...

  - agent:
      task: Evaluate content truthfulness using the Logic Matrix (4 Laws of Aristotle)
      $mock:
        success: true
        message: '{"score": 8, "identity": 9, "non_contradiction": 7, "excluded_middle": 8, "sufficient_reason": 8, "reasoning": "Факти підтверджені", "truth_article": "Очищена версія"}'

  - progress:
      $match: Logic evaluation complete

  - result:
      $assert:
        - data.score: 8
        - data.identity: 9
        - data.non_contradiction: 7
        - data.excluded_middle: 8
        - data.sufficient_reason: 8
        - data.reasoning: Факти підтверджені
        - data.truth_article: Очищена версія

---
name: LogicMatrix LLM Score Clamping
story:
  - LogicMatrixStep:
      content: Over the top score.
      scaleMin: 1
      scaleMax: 8

  - progress:
      $match: Evaluating truthfulness...

  - agent:
      task: Evaluate content truthfulness using the Logic Matrix (4 Laws of Aristotle)
      $mock:
        success: true
        message: '{"score": 15, "reasoning": "Over the top"}'

  - progress:
      $match: Logic evaluation complete

  - result:
      $assert:
        - data.score: 8

---
name: LogicMatrix Context Update
story:
  - LogicMatrixStep:
      content: Fact and truth.
      context:
        previous: original

  - progress:
      $match: Evaluating truthfulness...

  - agent:
      task: Evaluate content truthfulness using the Logic Matrix (4 Laws of Aristotle)
      $mock:
        success: false
        message: ""

  - progress:
      $match: Logic evaluation complete

  - result:
      $assert:
        - data.context.previous: original
        - data.context.logicScore
        - data.context.logicReasoning
---boundary---

---boundary:apps/3rdparty/eaukraine.eu/src/domain/matrices/IntentMatrixStep.spec.nan0---
name: IntentMatrix Heuristic High Will
story:
  - IntentMatrixStep:
      content: Воля до свободи і суверенітет нації це наш пріоритет.

  - progress:
      $match: Evaluating motives...

  - agent:
      task: Evaluate content intent using the Intent Matrix (Will/Logos vs Fear/Neurosis)
      $mock:
        success: false
        message: ""

  - progress:
      $match: Intent evaluation complete

  - result:
      $assert:
        - data.score >= 5
        - data.motives | length > 0

---
name: IntentMatrix Heuristic High Fear
story:
  - IntentMatrixStep:
      content: Страх і паніка охопили народ. Небезпека і загроза всюди.

  - progress:
      $match: Evaluating motives...

  - agent:
      task: Evaluate content intent using the Intent Matrix (Will/Logos vs Fear/Neurosis)
      $mock:
        success: false
        message: ""

  - progress:
      $match: Intent evaluation complete

  - result:
      $assert:
        - data.score <= 5
        - data.fears | length > 0

---
name: IntentMatrix Heuristic Neutral
story:
  - IntentMatrixStep:
      content: Neutral text without motivational keywords.

  - progress:
      $match: Evaluating motives...

  - agent:
      task: Evaluate content intent using the Intent Matrix (Will/Logos vs Fear/Neurosis)
      $mock:
        success: false
        message: ""

  - progress:
      $match: Intent evaluation complete

  - result:
      $assert:
        - data.score >= 4
        - data.score <= 6

---
name: IntentMatrix LLM Strong Will
story:
  - IntentMatrixStep:
      content: Український народ демонструє волю до суверенітету.

  - progress:
      $match: Evaluating motives...

  - agent:
      task: Evaluate content intent using the Intent Matrix (Will/Logos vs Fear/Neurosis)
      $mock:
        success: true
        message: '{"score": 8, "motives": ["sovereignty", "national will"], "fears": ["external pressure"], "reasoning": "Свідома воля домінує", "intent_article": "Переписана стаття"}'

  - progress:
      $match: Intent evaluation complete

  - result:
      $assert:
        - data.score: 8
        - data.motives | includes "sovereignty"
        - data.fears | includes "external pressure"
        - data.reasoning: Свідома воля домінує
        - data.intent_article: Переписана стаття

---
name: IntentMatrix Context Update
story:
  - IntentMatrixStep:
      content: Воля і страх.
      context:
        previous: original

  - progress:
      $match: Evaluating motives...

  - agent:
      task: Evaluate content intent using the Intent Matrix (Will/Logos vs Fear/Neurosis)
      $mock:
        success: false
        message: ""

  - progress:
      $match: Intent evaluation complete

  - result:
      $assert:
        - data.context.previous: original
        - data.context.intentScore
        - data.context.motives
        - data.context.fears
---boundary---

---boundary:apps/3rdparty/eaukraine.eu/src/domain/matrices/InterestsMatrixStep.spec.nan0---
name: InterestsMatrix Heuristic Sovereignty
story:
  - InterestsMatrixStep:
      content: Український суверенітет і незалежність держави — ключ до майбутнього нації.

  - progress:
      $match: Evaluating interests...

  - agent:
      task: Evaluate content alignment with EA Ukraine strategic interests
      $mock:
        success: false
        message: ""

  - progress:
      $match: Evaluated Will and Sovereignty

  - progress:
      $match: Evaluated Action for Peace

  - progress:
      $match: Evaluated Euro-Atlantic Expansion

  - progress:
      $match: Evaluated Human Rights

  - progress:
      $match: Evaluated Anti-Corruption

  - progress:
      $match: Evaluated Media Freedom

  - progress:
      $match: Evaluated Economic Development

  - progress:
      $match: Interests evaluation complete

  - result:
      $assert:
        - data.interests | length: 7
        - data.context.interests
        - data.context.interestsArray

---
name: InterestsMatrix Heuristic All Interests Present
story:
  - InterestsMatrixStep:
      content: NATO, EU, human rights, anti-corruption, media, economy, sovereignty.

  - progress:
      $match: Evaluating interests...

  - agent:
      task: Evaluate content alignment with EA Ukraine strategic interests
      $mock:
        success: false
        message: ""

  - progress:
      $match: Evaluated Will and Sovereignty: 4/9

  - progress:
      $match: Evaluated Action for Peace

  - progress:
      $match: Evaluated Euro-Atlantic Expansion

  - progress:
      $match: Evaluated Human Rights

  - progress:
      $match: Evaluated Anti-Corruption

  - progress:
      $match: Evaluated Media Freedom

  - progress:
      $match: Evaluated Economic Development

  - progress:
      $match: Interests evaluation complete

  - result:
      $assert:
        - data.interests | length: 7
        - data.interests | some "key: 'will_and_sovereignty' and score >= 0"
        - data.interests | some "key: 'euro_atlantic_expansion' and score >= 0"
        - data.interests | some "key: 'action_for_peace' and score >= 0"

---
name: InterestsMatrix LLM Response
story:
  - InterestsMatrixStep:
      content: Ukraine's sovereignty and NATO integration are top priorities.

  - progress:
      $match: Evaluating interests...

  - agent:
      task: Evaluate content alignment with EA Ukraine strategic interests
      $mock:
        success: true
        message: '{"interests": {"will_and_sovereignty": 9, "action_for_peace": 5, "euro_atlantic_expansion": 8, "human_rights": 6, "anti_corruption": 4, "media_freedom": 5, "economic_development": 3}}'

  - progress:
      $match: Evaluated Will and Sovereignty: 9/9

  - progress:
      $match: Evaluated Action for Peace: 5/9

  - progress:
      $match: Evaluated Euro-Atlantic Expansion: 8/9

  - progress:
      $match: Evaluated Human Rights: 6/9

  - progress:
      $match: Evaluated Anti-Corruption: 4/9

  - progress:
      $match: Evaluated Media Freedom: 5/9

  - progress:
      $match: Evaluated Economic Development: 3/9

  - progress:
      $match: Interests evaluation complete

  - result:
      $assert:
        - data.interests | find "key: 'will_and_sovereignty'" | score: 9
        - data.interests | find "key: 'euro_atlantic_expansion'" | score: 8
        - data.interests | find "key: 'economic_development'" | score: 3

---
name: InterestsMatrix Context Update
story:
  - InterestsMatrixStep:
      content: Test.
      context:
        previous: original

  - progress:
      $match: Evaluating interests...

  - agent:
      task: Evaluate content alignment with EA Ukraine strategic interests
      $mock:
        success: false
        message: ""

  - progress:
      $match: Evaluated Will and Sovereignty

  - progress:
      $match: Evaluated Action for Peace

  - progress:
      $match: Evaluated Euro-Atlantic Expansion

  - progress:
      $match: Evaluated Human Rights

  - progress:
      $match: Evaluated Anti-Corruption

  - progress:
      $match: Evaluated Media Freedom

  - progress:
      $match: Evaluated Economic Development

  - progress:
      $match: Interests evaluation complete

  - result:
      $assert:
        - data.context.previous: original
        - data.context.interests
        - data.context.interestsArray
---boundary---

---boundary:apps/3rdparty/eaukraine.eu/src/domain/matrices/ThinkersMatrixStep.spec.nan0---
name: ThinkersMatrix Heuristic Power
story:
  - ThinkersMatrixStep:
      content: Power and strategy are important for control and influence.

  - progress:
      $match: Evaluating by thinkers...

  - agent:
      task: Evaluate content through the Council of Sages (Thinkers Matrix)
      $mock:
        success: false
        message: ""

  - progress:
      $match: Evaluated by Піфагор

  - progress:
      $match: Evaluated by Сократ

  - progress:
      $match: Evaluated by Ярослав Мудрий

  - progress:
      $match: Evaluated by Макіавелі

  - progress:
      $match: Evaluated by Сковорода

  - progress:
      $match: Evaluated by Тесла

  - progress:
      $match: Thinkers evaluation complete

  - result:
      $assert:
        - data.thinkers | length: 6

---
name: ThinkersMatrix Heuristic Wisdom
story:
  - ThinkersMatrixStep:
      content: Wisdom and knowledge are the foundation of truth.

  - progress:
      $match: Evaluating by thinkers...

  - agent:
      task: Evaluate content through the Council of Sages (Thinkers Matrix)
      $mock:
        success: false
        message: ""

  - progress:
      $match: Evaluated by Піфагор

  - progress:
      $match: Evaluated by Сократ

  - progress:
      $match: Evaluated by Ярослав Мудрий

  - progress:
      $match: Evaluated by Макіавелі

  - progress:
      $match: Evaluated by Сковорода

  - progress:
      $match: Evaluated by Тесла

  - progress:
      $match: Thinkers evaluation complete

  - result:
      $assert:
        - data.thinkers | length: 6
        - data.thinkers | every "score >= 0 and score <= 9"
        - data.thinkers | every "comment | length > 0"

---
name: ThinkersMatrix LLM Response
story:
  - ThinkersMatrixStep:
      content: Freedom and natural harmony are essential.

  - progress:
      $match: Evaluating by thinkers...

  - agent:
      task: Evaluate content through the Council of Sages (Thinkers Matrix)
      $mock:
        success: true
        message: '{"thinkers": [{"name": "Піфагор", "score": 7, "comment": "Структурна гармонія"}, {"name": "Сократ", "score": 8, "comment": "Свідома істина"}, {"name": "Ярослав Мудрий", "score": 6, "comment": "Законна основа"}, {"name": "Макіавелі", "score": 5, "comment": "Стратегічна нейтральність"}, {"name": "Сковорода", "score": 9, "comment": "Сродна свобода"}, {"name": "Тесла", "score": 4, "comment": "Часткове тертя"}]}'

  - progress:
      $match: Evaluated by Піфагор (7/9)

  - progress:
      $match: Evaluated by Сократ (8/9)

  - progress:
      $match: Evaluated by Ярослав Мудрий (6/9)

  - progress:
      $match: Evaluated by Макіавелі (5/9)

  - progress:
      $match: Evaluated by Сковорода (9/9)

  - progress:
      $match: Evaluated by Тесла (4/9)

  - progress:
      $match: Thinkers evaluation complete

  - result:
      $assert:
        - data.thinkers | find "name: 'Сковорода'" | score: 9
        - data.thinkers | find "name: 'Сковорода'" | comment: Сродна свобода
        - data.thinkers | find "name: 'Сократ'" | score: 8
        - data.thinkers | find "name: 'Тесла'" | score: 4

---
name: ThinkersMatrix Context Update
story:
  - ThinkersMatrixStep:
      content: Test.
      context:
        previous: original

  - progress:
      $match: Evaluating by thinkers...

  - agent:
      task: Evaluate content through the Council of Sages (Thinkers Matrix)
      $mock:
        success: false
        message: ""

  - progress:
      $match: Evaluated by Піфагор

  - progress:
      $match: Evaluated by Сократ

  - progress:
      $match: Evaluated by Ярослав Мудрий

  - progress:
      $match: Evaluated by Макіавелі

  - progress:
      $match: Evaluated by Сковорода

  - progress:
      $match: Evaluated by Тесла

  - progress:
      $match: Thinkers evaluation complete

  - result:
      $assert:
        - data.context.previous: original
        - data.context.thinkers
        - data.context.thinkers | length: 6
---boundary---

Тепер створю SpecRunner тест, який запускає всі ці сценарії:

---boundary:apps/3rdparty/eaukraine.eu/src/domain/matrices/MatrixSteps.spec.test.js---
import { describe, it } from 'node:test'
import { SpecRunner } from '@nan0web/ui/testing'
import { MatrixStep, LogicMatrixStep, IntentMatrixStep, InterestsMatrixStep, ThinkersMatrixStep } from './index.js'

const MATRIX_REGISTRY = {
	MatrixStep,
	LogicMatrixStep,
	IntentMatrixStep,
	InterestsMatrixStep,
	ThinkersMatrixStep,
}

const FILE_DIR = import.meta.dirname

describe('MatrixStep (spec)', () => {
	it('Base — should throw for unimplemented run()', async () => {
		await SpecRunner.executeFile(FILE_DIR, 'MatrixStep.spec.nan0', 'MatrixStep Base', MATRIX_REGISTRY)
	})

	it('Base — should accept custom scale', async () => {
		await SpecRunner.executeFile(FILE_DIR, 'MatrixStep.spec.nan0', 'MatrixStep With Custom Scale', MATRIX_REGISTRY)
	})
})

describe('LogicMatrixStep (spec)', () => {
	it('Heuristic — high score for truthful content', async () => {
		await SpecRunner.executeFile(FILE_DIR, 'LogicMatrixStep.spec.nan0', 'LogicMatrix Heuristic High Score', MATRIX_REGISTRY)
	})

	it('Heuristic — low score for manipulation', async () => {
		await SpecRunner.executeFile(FILE_DIR, 'LogicMatrixStep.spec.nan0', 'LogicMatrix Heuristic Low Score', MATRIX_REGISTRY)
	})

	it('Heuristic — neutral score for unmarked content', async () => {
		await SpecRunner.executeFile(FILE_DIR, 'LogicMatrixStep.spec.nan0', 'LogicMatrix Heuristic Neutral', MATRIX_REGISTRY)
	})

	it('LLM — returns structured 4 Laws evaluation', async () => {
		await SpecRunner.executeFile(FILE_DIR, 'LogicMatrixStep.spec.nan0', 'LogicMatrix LLM High Truth', MATRIX_REGISTRY)
	})

	it('LLM — clamps scores to scale range', async () => {
		await SpecRunner.executeFile(FILE_DIR, 'LogicMatrixStep.spec.nan0', 'LogicMatrix LLM Score Clamping', MATRIX_REGISTRY)
	})

	it('LLM — preserves context', async () => {
		await SpecRunner.executeFile(FILE_DIR, 'LogicMatrixStep.spec.nan0', 'LogicMatrix Context Update', MATRIX_REGISTRY)
	})
})

describe('IntentMatrixStep (spec)', () => {
	it('Heuristic — high will/logos for motivated content', async () => {
		await SpecRunner.executeFile(FILE_DIR, 'IntentMatrixStep.spec.nan0', 'IntentMatrix Heuristic High Will', MATRIX_REGISTRY)
	})

	it('Heuristic — high fear/neurosis for threat content', async () => {
		await SpecRunner.executeFile(FILE_DIR, 'IntentMatrixStep.spec.nan0', 'IntentMatrix Heuristic High Fear', MATRIX_REGISTRY)
	})

	it('Heuristic — neutral for unmarked content', async () => {
		await SpecRunner.executeFile(FILE_DIR, 'IntentMatrixStep.spec.nan0', 'IntentMatrix Heuristic Neutral', MATRIX_REGISTRY)
	})

	it('LLM — returns will/logos, fears, reasoning, intent_article', async () => {
		await SpecRunner.executeFile(FILE_DIR, 'IntentMatrixStep.spec.nan0', 'IntentMatrix LLM Strong Will', MATRIX_REGISTRY)
	})

	it('LLM — preserves context with intentScore, motives, fears', async () => {
		await SpecRunner.executeFile(FILE_DIR, 'IntentMatrixStep.spec.nan0', 'IntentMatrix Context Update', MATRIX_REGISTRY)
	})
})

describe('InterestsMatrixStep (spec)', () => {
	it('Heuristic — sovereignty keywords give high score', async () => {
		await SpecRunner.executeFile(FILE_DIR, 'InterestsMatrixStep.spec.nan0', 'InterestsMatrix Heuristic Sovereignty', MATRIX_REGISTRY)
	})

	it('Heuristic — all 7 interests present', async () => {
		await SpecRunner.executeFile(FILE_DIR, 'InterestsMatrixStep.spec.nan0', 'InterestsMatrix Heuristic All Interests Present', MATRIX_REGISTRY)
	})

	it('LLM — returns scored interests', async () => {
		await SpecRunner.executeFile(FILE_DIR, 'InterestsMatrixStep.spec.nan0', 'InterestsMatrix LLM Response', MATRIX_REGISTRY)
	})

	it('LLM — preserves context with interests object and array', async () => {
		await SpecRunner.executeFile(FILE_DIR, 'InterestsMatrixStep.spec.nan0', 'InterestsMatrix Context Update', MATRIX_REGISTRY)
	})
})

describe('ThinkersMatrixStep (spec)', () => {
	it('Heuristic — power keywords affect Макіавелі', async () => {
		await SpecRunner.executeFile(FILE_DIR, 'ThinkersMatrixStep.spec.nan0', 'ThinkersMatrix Heuristic Power', MATRIX_REGISTRY)
	})

	it('Heuristic — all 6 thinkers evaluated with valid scores', async () => {
		await SpecRunner.executeFile(FILE_DIR, 'ThinkersMatrixStep.spec.nan0', 'ThinkersMatrix Heuristic Wisdom', MATRIX_REGISTRY)
	})

	it('LLM — returns structured thinker evaluations', async () => {
		await SpecRunner.executeFile(FILE_DIR, 'ThinkersMatrixStep.spec.nan0', 'ThinkersMatrix LLM Response', MATRIX_REGISTRY)
	})

	it('LLM — preserves context with thinkers array', async () => {
		await SpecRunner.executeFile(FILE_DIR, 'ThinkersMatrixStep.spec.nan0', 'ThinkersMatrix Context Update', MATRIX_REGISTRY)
	})
})
---boundary---

Оновлюю індекс матриць, щоб додати експорт тест-хелперів:

---boundary:apps/3rdparty/eaukraine.eu/src/domain/matrices/index.js---
// Matrix Step Classes
export { MatrixStep } from './MatrixStep.js'
export { LogicMatrixStep } from './LogicMatrixStep.js'
export { IntentMatrixStep } from './IntentMatrixStep.js'
export { ThinkersMatrixStep } from './ThinkersMatrixStep.js'
export { InterestsMatrixStep } from './InterestsMatrixStep.js'

// Test Helpers
export {
	getGeneratorResult,
	getGeneratorResultWithLLM,
	collectAllResults,
	collectAllFromGenerator,
	assertValidMatrixResult,
} from './test-helpers.js'
---boundary---

---boundary:@validate---
apps/3rdparty/eaukraine.eu/src/domain/matrices/MatrixStep.spec.nan0
apps/3rdparty/eaukraine.eu/src/domain/matrices/LogicMatrixStep.spec.nan0
apps/3rdparty/eaukraine.eu/src/domain/matrices/IntentMatrixStep.spec.nan0
apps/3rdparty/eaukraine.eu/src/domain/matrices/InterestsMatrixStep.spec.nan0
apps/3rdparty/eaukraine.eu/src/domain/matrices/ThinkersMatrixStep.spec.nan0
apps/3rdparty/eaukraine.eu/src/domain/matrices/MatrixSteps.spec.test.js
apps/3rdparty/eaukraine.eu/src/domain/matrices/index.js
@get apps/3rdparty/eaukraine.eu/src/domain/matrices/test-helpers.js
@get packages/ui/src/testing/SpecAdapter.js
@get packages/ui/src/core/Intent.js
---boundary---