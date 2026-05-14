---
description: Формат мово-незалежних правил (Cross-platform)
---

# `cross-platform-engineering` Workflow

> **Призначення:** Цей workflow забезпечує те, щоб архітектурні патерни 0HCAI.framework (Zero-Hallucination) працювали на Python, Go, C++ чи будь-якій іншій мові програмування.

## 1. Патерн, а не Синтаксис

Головне правило: 0HCAI — це не про те, ЯК писати JavaScript, це про те, ЯКОЮ має бути архітектура.
Коли AI генерує код для Python (наприклад, `FastAPI` чи `Pydantic` моделі) або `Go`:

- **Model-as-Schema:** Замість класів JS з метаданими використовуються Python `Pydantic` або Go `Structs` з тегами (наприклад, `json:"name" search:"true"`).
- **Дзеркала Даних (Dumb Views):** Будь-який Python-шаблон (Jinja2) або iOS-інтерфейс не має містити трансляцій (тернарних операторів). Ресурс береться ззовні.

## 2. Адаптація Blueprint Engine

При роботі в не-node.js середовищах:

- Blueprint шаблони існують у форматі `.agent/templates/blueprint-python/`, `.agent/templates/blueprint-go/` тощо.
- Файл `seed.md` залишається незмінним — Конституція проекту не залежить від мови.

## 3. Адаптація Contract Welding

- Snapshot - тестування є обов'язковим. Якщо це Python CLI, AI має написати `pytest` із `capsys`, щоб зафіксувати вивід в консоль.
- Заборонено здавати Python/Go модуль без автоматичного тесту на його візуалізацію чи консольний I/O.
