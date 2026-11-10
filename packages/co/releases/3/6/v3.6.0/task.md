# Task: Реліз Фракталу Семи (7i) у @nan0web/co v3.6.0

## Мета
Реалізувати та оновити контракт універсальних веб-моделей Фракталу Семи (7i) безпосередньо у ядрі `@nan0web/co`. Моделі є data-driven, не мають зовнішніх залежностей (Zero Runtime Dependencies) та служать SSOT для будь-яких веб-інтерфейсів та адаптерів CMS.

## Архітектурне першоджерело
Детальний узгоджений план зафіксовано в:
`/Users/i/src/nan.web/apps/3rdparty/payload-cms/docs/PLAN_REAL_MODELS_SYNC.md`

## Моделі Фракталу 7i (`packages/co/src/domain/`)
1. **`Identity.js`** (`extends Model`):
   - `id` / `did` (унікальний ідентифікатор суб'єкта)
   - `type`: `'person' | 'org' | 'site'`
   - `title`: основна назва суб'єкта (замість зарезервованого `name`)
   - `role`: посада / слоган
   - `declaration`: маніфест, біографія або місія (Markdown)
   - `avatar`: посилання на ID медіа
   - `endpoints`: масив `Contact[]` (з автопарсингом URI без явного зазначення `type`: `mailto:...`, `https:...`, `tel:...`)
   - `wallets`: масив адрес криптогаманців
   - `credentials`: об'єкт додаткових реквізитів (ліцензії, свідоцтва, публічні ключі)
2. **`Connection.js`** (`extends Model`):
   - `id`: slug категорії або навігації
   - `title`: назва зв'язку
   - `context`: `'navigation' | 'category' | 'relation'`
   - `role`: `'header' | 'footer' | 'topic' | 'partner'`
   - `target_did`: цільовий або батьківський ID
   - `items`: ієрархічні підпункти навігації (`title`, `href`, `items`)
3. **`Post.js`** (`extends Chat` -> `Message`):
   - `id`: URL slug
   - `type`: `'page' | 'post' | 'news' | 'doc' | 'case'`
   - `title`: заголовок H1
   - `excerpt`: лід / анонс
   - `body`: контент (Markdown / sections)
   - `time`: дата/час публікації
   - `status`: `'draft' | 'plan' | 'live' | 'archived' | 'deleted'`
   - `authors`: масив `Contact[]` або посилань на `Identity` (з гетером `author` для першого елемента)
   - `tags`: масив тегів / категорій
   - `media`: масив посилань на ID медіа-артефактів (`string[]`)
   - `next`: дерево коментарів або оновлень (`Chat`)
4. **`Media.js`** (`extends Model`):
   - `id`: ідентифікатор медіа
   - `url`: шлях до файлу або зовнішній URL
   - `mime`: MIME-тип файлу (без застарілого `type`, категорія визначається як `mime.split('/')[0]`)
   - `caption`: підпис / alt
   - `filesize`: розмір у байтах
   - `dimensions`: `{ width, height }`
   - *Важливо*: жодного контекстного `placement` — позиціонування живе в контексті `Post`!
5. **`Interaction.js`** (`extends Message`):
   - `id`: номер звернення / взаємодії
   - `type`: `'intake' | 'order' | 'contact' | 'feedback' | 'vote'`
   - `title`: тема
   - `status`: `'new' | 'pending' | 'processing' | 'resolved' | 'rejected' | 'spam' | 'archived'`
   - `time`: дата/час
   - `sender`: контакт відправника (`Contact`, автопарсинг з URI)
   - `body`: текст повідомлення
   - `payload`: довільний валідований об'єкт бізнес-даних
6. **`Good.js`** (`extends Interaction` — створити новий):
   - Класична онтологія цінності (товари, послуги, тарифи, програми)
   - `id`: slug продукту чи послуги
   - `type`: `'product' | 'service' | 'tariff' | 'program'`
   - `title`: назва блага
   - `excerpt`: коротка ціннісна пропозиція
   - `body`: повний опис (Markdown)
   - `currency`: валюта (`EUR`, `UAH`, `USD`)
   - `price`: умови/вартість (`Record<string, any>`)
   - `features`: список переваг (`string[]`)
   - `documents`: масив посилань на PDF-тарифи чи договори (`string[]`)
7. **`Event.js`** (`extends Interaction`):
   - `id`: slug події або локації
   - `type`: `'location' | 'branch' | 'event' | 'milestone' | 'hearing'`
   - `title`: назва
   - `location`: фізична адреса або URL
   - `coordinates`: `{ lat, lng }`
   - `starts_at`: дата початку або розклад
   - `ends_at`: дата завершення
   - `contacts`: масив контактів (`Contact[]`)

## Завдання
1. Доопрацювати та експортувати 7 моделей у `packages/co/src/domain/`.
2. Написати контрактні тести у `releases/3/6/v3.6.0/task.spec.js`.
3. Оновити експорти в `packages/co/src/domain/index.js` та `packages/co/src/index.js`.
4. Згенерувати `.d.ts` типи за допомогою `pnpm run build:types` (або `pnpm run types`).
