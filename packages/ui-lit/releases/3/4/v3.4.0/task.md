---
version: 3.4.0
type: test
status: planning
locale: uk
components: ["UIPage", "UINav", "UISidebar", "UIAlert", "UIMarkdown", "UIInput", "UISelect", "UIButton"]
---

# ⚡ Mission: Верифікація та Відповідність Контрактам у @nan0web/ui-lit (v3.4.0)

## 🏁 Overview (Огляд)
Перевірка та валідація реалізації всіх 26 компонентів `@nan0web/ui-lit` на 100% відповідність універсальним контрактам з `@nan0web/ui` (v3.4.0). Уніфікація найменувань властивостей (`properties`), слотів (`slots`) та вихідних подій (`CustomEvent`).

## 👥 User Stories (Сценарії)
- Як розробник, я хочу бути впевненим, що `<ui-nav>`, `<ui-sidebar>`, `<ui-page>` та інші компоненти точно відповідають універсальним контрактам `@nan0web/ui`.
- Як розробник, я хочу, щоб компоненти випромінювали нормалізовані події для обробки адаптерами.

## 🎯 Scope (Задачі)
- [ ] Перевірити та узгодити `properties` кожного компонента згідно з відповідним `*Contract` з `@nan0web/ui`.
- [ ] Забезпечити стандартизовану генерацію подій (CustomEvent із передачею `detail`).
- [ ] Створити тест відповідності контрактам у `releases/3/4/v3.4.0/task.spec.js`.

## ✅ Acceptance Criteria (DoD)
- [ ] Тести відповідності контрактам проходять (`pnpm test`).
- [ ] Жодних розбіжностей у назвах пропсів (`brand`, `items`, `title` тощо) між `@nan0web/ui` та `@nan0web/ui-lit`.
