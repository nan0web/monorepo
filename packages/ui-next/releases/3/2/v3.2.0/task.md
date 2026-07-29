---
version: 3.2.0
type: architecture
status: active
locale: uk
models: []
---

# 🚀 Mission: OLMUI Next.js Adapter Architecture (v3.2.0)

## 🏁 Overview (Огляд)

Перехід пакета `@nan0web/ui-next` на архітектуру OLMUI Adapters. Пакет стає агностичним до бекенду (підтримує Local/Tauri та SPA/API через Next.js Static Export) і відповідає за відображення інтенцій генератора доменних моделей у React.
У цій версії також реалізується архітектура "Server React" для забезпечення SSG/PWA, додається інтерактивний Sandbox з редактором контенту та базові структурні компоненти (Header, Footer, Navigation).

## 👥 User Stories (Сценарії)

1. Як розробник, я хочу використовувати `useOlmuiGenerator(model)` у Next.js компонентах, щоб автоматично перетворювати `yield ask/show/progress` у відповідні React-форми та сповіщення.
1. Як розробник, я хочу рендерити дерево моделей з `index.nan0` на сервері для кращого SEO та SSG (`ServerElement.jsx`), залишаючи інтерактивними лише ті компоненти (Apps), які цього вимагають (`ClientAppLoader.jsx`).
1. Як користувач, я хочу, щоб навігаційні лінки працювали через SPA-роутер Next.js (next/link або useRouter), щоб сторінка не перезавантажувалась цілком (PWA ready).
1. Як архітектор/редактор, я хочу мати вбудований Sandbox у `ui-next`, де можна редагувати контент (напр. JSON/Payload) і миттєво бачити його рендеринг за допомогою базових компонентів (Header, Footer, Navigation).

## 🏗 Data-Driven Architecture (Моделювання)

Адаптер не містить власних доменних моделей. Він експортує хуки та компоненти для обробки моделей з `@nan0web/ui`.
Основні сутності:

- `useOlmuiGenerator(model)` — React-хук для менеджменту інтенцій.
- `<OlmuiAdapter state={state} />` — Майстер-компонент.
- `ServerElement.jsx` (RSC) та `ClientAppLoader.jsx` (Client) — гібридний рендеринг.
- `NextUiRoot.jsx` — Провайдер, що мапить OLMUI-роутинг на `next/navigation`.
- Базові компоненти `Header`, `Footer`, `Navigation` (для Sandbox).

## 🎯 Scope (Задачі)

- [x] Оновити `package.json` до версії `3.2.0` та налаштувати NPM-скрипти.
- [x] Створити ядро: `useOlmuiGenerator.js`.
- [x] Зібрати інтеграційний компонент `<OlmuiAdapter />`.
- [x] Створити `ServerElement.jsx` та `ClientAppLoader.jsx`.
- [x] Створити `NextUiRoot.jsx` (мапінг `useRouter().push` та `usePathname()`).
- [x] Перевірити/додати базові компоненти (`Header`, `Footer`, `Navigation`) у `ui` або `ui-next`.
- [x] Створити інтерактивний Sandbox з редактором (Payload CMS / JSON Editor) для тестування контенту.
- [x] Видалити хардкод `NextAdminAdapter` та `actions.js` з ядра (успішно видалено раніше).

## ✅ Acceptance Criteria (DoD)

- [ ] **Контрактні тести** (`task.spec.js` та інші spec-файли) успішно проходять (Green).
- [ ] **Data Architecture**: Адаптер не містить хардкоду бізнес-логіки.
- [ ] Sandbox успішно рендерить контент і дозволяє його редагувати (Live Preview).
- [ ] Пакет успішно збирається командою `tsc` (генерує `dist/` без помилок).
