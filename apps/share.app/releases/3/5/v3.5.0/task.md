---
version: 3.5.0
type: feature
status: active
locale: uk
models:
  - VideoSlicerPort
  - DirectorCutAnalyzer
  - VideoPipelineCommand
---

# 🎬 Mission: Concat/Stitch з xfade/acrossfade та Crop Offset & Padding для Вісника (v3.5.0)

## 🏁 Overview (Огляд)

Реліз v3.5.0 розширює можливості режисерського монтажу (Director's Cut) у `visnyk` (`share.app`):
1. **Stitch / Concat Pipeline (Об'єднання сцен із плавним переходом):**
   - Можливість автоматично або через параметр `--stitch` об'єднувати нарізані сцени (`scene_code_1` + `scene_chat_2` ...) в одне фінальне відео.
   - Застосування FFmpeg фільтра `xfade` (наприклад, `fade`, `wipeleft`, `slideleft`, `dissolve` з тривалістю 0.3–0.5 с) між відеопотоками.
   - Застосування аудіокросфейду `acrossfade` для плавного переходу звукових доріжок без клацання чи раптових пауз.
2. **Crop Offset & Padding (Гнучке зміщення вікна 9:16):**
   - Підтримка зсуву кадрування `left+100`, `left-50`, `right-80`, `center+20` у параметрі `--scenes` (наприклад, `--scenes "code=left+100,chat=right-50"`).
   - Точний розрахунок координат X/Y з обмеженням (clamping), щоб не виходити за межі вихідного відео (`0 <= cropX <= in_w - out_w`).

## 👥 User Stories (Сценарії)

- Як автор технічного відео, я хочу змістити вертикальний кадр 9:16 на сцені з кодом на 100 пікселів праворуч від лівого краю (`code=left+100`), щоб у кадр потрапляв саме редактор без зайвих іконок дока.
- Як блогер, після запису декількох дублів або зміни ракурсів я хочу отримати єдине зшите відео з гарними кінематографічними переходами (`visnyk pipeline:video --stitch --transition slideleft --transitionDuration 0.5`).

## 🏗 Data-Driven Architecture

### 1. Формат конфігурації `--scenes` з Offset:
- `align=left|right|center`
- `align+offset` або `align-offset`, наприклад:
  - `left+100`: початок від лівого краю зі зміщенням +100px.
  - `right-50`: від правого краю зі зміщенням -50px.
  - `center+20`: від центру зі зміщенням +20px.
- Формула FFmpeg `cropX`:
  - `left`: `min(max(0, 0 + offset), in_w - out_w)`
  - `right`: `min(max(0, in_w - out_w + offset), in_w - out_w)`
  - `center`: `min(max(0, (in_w - out_w)/2 + offset), in_w - out_w)`

### 2. Складання ланцюжка xfade та acrossfade для N кліпів:
- Для $N$ кліпів із тривалостями $D_0, D_1, \dots, D_{N-1}$ та часом переходу $T$:
  - Зсув першого переходу: $\text{offset}_0 = D_0 - T$
  - Зсув $k$-го переходу: $\text{offset}_k = \text{offset}_{k-1} + D_k - T$
  - Загальна тривалість: $\sum D_i - (N-1) \times T$.

## 🎯 Scope (Задачі)

1. Створити контрактний тест `releases/3/5/v3.5.0/task.spec.js`.
2. Реалізувати розпізнавання та розрахунок зміщень (offset) у `DirectorCutAnalyzer.js` та `VideoSlicerPort.js`.
3. Реалізувати `VideoSlicerPort.buildStitchCommand` та `VideoSlicerPort.stitch` з підтримкою ланцюжків `xfade` та `acrossfade`.
4. Інтегрувати прапор `--stitch` та параметри переходу (`--transition`, `--transition-duration`) у `VideoPipelineCommand.js`.
5. Перевірити проходження всіх тестів.

## ✅ Acceptance Criteria (Критерії прийомки)

- [x] Контрактні тести `task.spec.js` проходять успішно (7/7 тестів).
- [x] Підтримка вирівнювання з offset (`left+X`, `right-X`, `center+X`) генерує коректний FFmpeg `crop` вираз.
- [x] Метод `buildStitchCommand` формує коректний фільтр-граф `filter_complex` з `xfade` та `acrossfade` для 2 або більше відеофрагментів.
- [x] Опція `--stitch` у `VideoPipelineCommand` генерує фінальний зшитий файл `stitched.mp4`.
