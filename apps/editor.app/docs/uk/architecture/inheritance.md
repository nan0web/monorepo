# 🌳 Успадкування (Inheritance)

> Каскадні налаштування через `_.nan0` файли, візуалізація графів залежностей та зручне редагування.

---

## Визначення

Успадкування — це механізм, за якого налаштування з батьківських директорій автоматично поширюються на всі вкладені файли та папки. Файл `_.nan0` діє як "CSS для даних": визначає контекст, тему, мову та права доступу для всього, що знаходиться нижче в ієрархії.

## Архітектура каскаду

Конфігурація визначається на рівні директорій. Розширення файлу (`.nan0`, `.md`, `.yaml`) має другорядне значення — система автоматично визначає тип контенту та експортує його у потрібному форматі.

```
data/
  _.nan0                    ← Глобальні: theme: dark, i18n: uk
  │
  ├── apps/
  │   ├── _.nan0            ← Для всіх додатків: permissions: admin
  │   │
  │   └── editor/
  │       └── _.nan0        ← Для редактора: bundled: 0, publicWrite: 0
  │
  └── presentation/
      └── _.md              ← Навіть Markdown може містити метадані успадкування
```

### Правила злиття (Merge Rules)

1. **Глибше = пріоритетніше**: Налаштування з `data/apps/editor/_.nan0` перевизначають `data/_.nan0`.
2. **Об'єктне злиття**: Вкладені об'єкти зливаються рекурсивно (deep merge).
3. **Масиви замінюються**: Масиви не зливаються, а повністю перевизначаються.

```yaml
# data/_.nan0 (Global)
ui:
  theme: "dark"
  font: "Outfit"
  i18n:
    default: "en"
    available: ["en", "uk"]

# data/presentation/_ (Override)
ui:
  theme: "light"
  # font та i18n успадковуються від батька
```

**Результат для `data/presentation/`**:
```yaml
ui:
  theme: "light"      # ← перевизначено
  font: "Outfit"      # ← успадковано
  i18n:
    default: "en"     # ← успадковано
    available: ["en", "uk"]
```

## Граф залежностей

Система будує **граф успадкування** для кожного документа. Це дозволяє:

1. **Бачити повний контекст**: Які налаштування застосовуються до конкретного файлу.
2. **Відстежувати зміни**: Яка зміна в батьківському `_.nan0` вплине на які документи.
3. **Знаходити конфлікти**: Де перевизначення створюють неочікувану поведінку.

```
data/presentation/01-latency
  │
  ├── inherits: data/presentation/_
  │     └── inherits: data/_
  │
  ├── $ref: tags/performance
  └── $ref: authors/yaro
```

### Візуалізація в редакторі

```
┌─────────────────────────────────────────────────┐
│ 📄 01-latency                                     │
│                                                   │
│ Inherited Settings:                               │
│ ┌───────────────────────────────────────────────┐ │
│ │ 🌐 data/_                                     │ │
│ │    theme: dark, font: Outfit, lang: en        │ │
│ │ ↓ overridden by                               │ │
│ │ 📂 data/presentation/_                        │ │
│ │    theme: light                               │ │
│ └───────────────────────────────────────────────┘ │
│                                                   │
│ References:                                       │
│ ├── 🏷 tags/performance                          │
│ └── 👤 authors/yaro                              │
│         └── 🏢 organizations/nan0web             │
└─────────────────────────────────────────────────┘
```

## Зручне редагування

### 1. Inline Override
Користувач може натиснути на успадковане значення та створити локальне перевизначення:

```
theme: dark (inherited from data/_.nan0) [Override]
```

Після натискання `[Override]`:
```
theme: [light] (local override)  [Revert to inherited]
```

### 2. Diff View
Порівняння локальних та успадкованих налаштувань:

```diff
# data/presentation/_
ui:
-  theme: "dark"    ← inherited
+  theme: "light"   ← local override
   font: "Outfit"   ← inherited (unchanged)
```

### 3. Impact Analysis
При зміні батьківського `_.nan0` система показує всі документи, що будуть вплинуті:

```
⚠ Зміна data/_ вплине на:
  → data/apps/editor/_ (3 documents)
  → data/presentation/_ (5 documents)
  → data/i18n/* (12 documents)
  
  Всього: 20 документів
```

## Аналоги

| Платформа | Успадкування | Візуалізація |
| :--- | :--- | :--- |
| **CSS** | Каскад стилів | DevTools Inspector |
| **Git** | `.gitignore` каскад | Немає |
| **Terraform** | Module variables | `terraform graph` |
| **NaN•Web** | `_.nan0` каскад | Inline Editor + Impact Analysis |
