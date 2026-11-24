---
version: 3.4.0
type: feature
status: active
locale: uk
models:
  - DirectorCutAnalyzer
  - VideoPipelineCommand
---

# 🎬 Mission: Режисерський Протокол OBS («Camera <Scene> | Start», «Camera Stop») та Аліас «Вісник» (v3.4.0)

## 🏁 Overview (Огляд)

Реліз v3.4.0 закладає основу для автономного процесу відеозйомки блогера:
1. Реєстрація системного бінарника **`visnyk`** (поруч із `share`).
2. Режисерський протокол OBS (**Director's Cut**):
   - Розпізнавання голосових маркерів початку сцени: `Camera <Scene>` або `Camera Start` (наприклад, `Camera Chat`, `Camera Code`, `Camera Presentation`, `Camera Start`).
   - Розпізнавання голосового маркера зупинки: `Camera Stop`.
3. Розумне видалення службових команд:
   - Автоматичне вирізання самих слів команди (`Camera ...`, `Camera Stop`) із фінального відеопотоку.
   - Застосування безпечних акустичних паддінгів (0.5–1.5 с) навколо контентної частини сцени, щоб уникнути обриву слів та зберегти природне дихання спікера.
4. Інтеграція у головний конвеєр `VideoPipelineCommand` (`visnyk pipeline:video`).

## 👥 User Stories (Сценарії)

- Як автор контенту, я записую одне довге безперервне відео в OBS, промовляючи голосом: *"Camera Chat... Привіт усім! Сьогодні розбираємо архітектуру... Camera Stop"*, *"Camera Code... Погляньмо на код тесту... Camera Stop"*.
- Як блогер, я запускаю `visnyk pipeline:video --url recording.mp4`, і система автоматично знаходить усі сцени, вирізає мої голосові команди `Camera ...`, додає паддінги 0.5–1.5 с і створює чисті, готові епізоди для YouTube та Shorts.

## 🏗 Data-Driven Architecture (Моделювання та Правила Маркерів)

### 🎙️ Голосові маркери та правила перемикання сцен:
| Маркер | Шаблон команди | Дія конвеєра `visnyk` |
| :--- | :--- | :--- |
| **Початок сцени** | `Camera <SceneName>` або `Camera Start` (напр. `Camera Chat`, `Camera Code`) | Відкриває нову сцену `<SceneName>`. Вирізає промову команди. Початок сцени = кінець команди мінус `paddingBefore` (0.5с). |
| **Пряме перемикання (Seamless)** | `Camera <Scene1>` ➔ `Camera <Scene2>` (без `Camera Stop`) | Автоматично закриває попередню сцену рівно перед початком фрази наступної команди, і відкриває нову сцену. Жодного зайвого `Camera Stop` говорити не потрібно! |
| **Напрямкові сцени (Directional)** | `Camera Left` / `Камера ліво`, `Camera Right` / `Камера право`, `Camera Center` / `Камера центр` | Автоматично створює сцену з прив'язкою вирівнювання (`align: 'left'`, `'right'`, `'center'`) для вертикального кропу 9:16 Shorts без прив'язки до доменних назв. |
| **Завершення сцени** | `Camera Stop` або `Камера стоп` | Закриває поточну сцену. Вирізає промову команди. |

### 🛠️ CLI Параметри `visnyk pipeline:video`:
- `--director-cut` (`boolean`, default: `false`): Вмикає аналіз режисерських маркерів.
- `--cut-silence` (`boolean`, default: `false`): За замовчуванням `false` — зберігає візуальні паузи та демонстрацію екрану між маркерами без обрізання мовчання. Якщо `true`, обрізає паузи до меж мовлення з паддінгами.
- `--min-silence-duration` (`number`, default: `2.0`): Мінімальна тривалість мовчання у секундах для тримінгу, коли увімкнено `--cut-silence`.
- `--scenes` (`string`, default: `''`): Кастомна геометрія кропу або вирівнювання (наприклад, `--scenes "code=left,chat=right"` або `--scenes "code=960x1080+0+0"` або шлях до `scenes.yaml`).
- `--padding-before` (`number`, default: `0.5`): Час у секундах перед початком мови сцени при обрізанні пауз.
- `--padding-after` (`number`, default: `1.0`): Час у секундах після завершення мови сцени при обрізанні пауз.
- `--publish` (`string`, comma-separated): Канали публікації (наприклад, `youtube,telegram`).

### 📦 Self-Contained Метадані Відео:
- Запис JSON-метаданих публікації у відеоконтейнер MP4/MOV через FFmpeg QuickTime User Data (`-metadata:s:v:0 comment="{...}"` або вільні udta-теги).
- Ліміт MP4/MOV на текстові метадані — до 4 ГБ на атом; безпечний обсяг у межах 1–5 МБ не створює жодного оверхеду для відеоплеєрів.
- Структура збережених метаданих:
  ```json
  {
    "published": {
      "youtube": { "id": "...", "url": "https://youtu.be/..." },
      "telegram": { "message_id": 123, "url": "https://t.me/.../123" }
    },
    "directorCut": { "scenes": ["Chat", "Code"] },
    "createdAt": "2026-10-31T17:30:00Z"
  }
  ```

## 🎯 Scope (Задачі)

1. Створити контрактний тест `releases/3/4/v3.4.0/task.spec.js` для `DirectorCutAnalyzer`.
2. Реалізувати `DirectorCutAnalyzer` у `src/domain/analysis/DirectorCutAnalyzer.js` з підтримкою напрямкових маркерів та геометрії.
3. Інтегрувати `DirectorCutAnalyzer` у `VideoPipelineCommand`.
4. Верифікувати проходження `pnpm run release:spec`.

## ✅ Acceptance Criteria (Критерії прийомки)

- [x] Контрактні тести `task.spec.js` проходять успішно (100% Green, 7/7 тестів).
- [x] Маркери `Camera Chat`, `Camera Code`, `Camera Start`, `Camera Left`, `Camera Right`, `Camera Center` та `Camera Stop` детектуються безпомилково українською та англійською мовами.
- [x] Самі слова маркера не потрапляють у фінальний часовий інтервал сцени.
- [x] Збереження демонстраційного мовчання за замовчуванням (`cutSilence: false`), опціональний тримінг мовчання (`cutSilence: true`).
- [x] Підтримка довільних координат вікон та вирівнювання через `--scenes` або конфігурацію.
- [x] Паддінг сцени регулюється (`paddingBefore`, `paddingAfter`).
