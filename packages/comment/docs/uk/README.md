# @nan0web/comment

Універсальний, zero-hardcode, zero-logic оверлей для коментарів та зворотного зв'язку.
Ідеально підходить для QA аудиту, збору UI відгуків та контекстних нотаток на сторінці.

## Встановлення

Як встановити за допомогою npm?
```bash
npm install @nan0web/comment
```

## Архітектура
Розроблено згідно строгих принципів OLMUI (One Logic — Many UI) та АрхіТехномага:
1. **Zero-Logic UI:** React або Web адаптер відповідає лише за DOM-вузли. Усі правила валідації та логіка переходів зберігаються у `CommentModel`.
2. **Zero-Hardcode та i18n:** Усі переклади та підписи надаються Моделлю, UI-адаптери ніколи не імпортують статичні мовні фрази самостійно.
3. **Model-as-Schema:** Повністю декларативний опис процесу залишення відгуку.
4. **URL Scoped:** Коментарі автоматично прив'язуються до поточного URL-руту сторінки, що чітко розмежовує локалізовані версії (наприклад, `/uk/` та `/en/`).

## Використання
### Базова інтеграція

Оберніть будь-який простий механізм збереження (наприклад, `localStorage` чи `IndexedDB`) 
у базовий DB-інтерфейс `{ save, loadAll, remove, clear }` і передайте його адаптеру.

Як ініціалізувати і запустити оверлей коментарів?
```js
import { WebCommentAdapter } from '@nan0web/comment'

// 1. Створення мокової (dummy) БД для збереження коментарів
class DemoDB {
	async save(comment) { console.info('Збережено:', comment.text) }
	async loadAll() { return [] }
	async clear() {}
	async remove() {}
}

// 2. Ініціалізація адаптера
const adapter = new WebCommentAdapter({
	db: new DemoDB(),
	t: (key) => key // звичайний мок-перекладач
})

// 3. Запуск основного потоку програмно
// adapter.start().then(result => console.info(result.action))
```

### Панель Коментарів та Експорт/Імпорт

Разом із адаптером природно поставляється інформаційна Панель Коментарів (Dashboard), яка містить:
- Перегляд існуючих коментарів, прив'язаних до поточного URL.
- Підсвічування конкретних елементів на сторінці за допомогою CSS Селектора.
- Зручний та миттєвий JSON Імпорт/Експорт просто з коробки.

Як відкрити Панель Коментарів?
```js
import { WebCommentAdapter } from '@nan0web/comment'

const adapter = new WebCommentAdapter({
	db: { async loadAll() { return [] }, async save() {}, async clear() {}, async remove() {} },
	t: (k) => k
})

// Програмне відкриття списку коментарів
// adapter.showCommentList()
```

## Основна логіка ядра (CommentModel)

Для більш просунутих сценаріїв (наприклад, для CLI інструментів чи Unit тестування) можна напряму працювати з генератором `CommentModel`, повністю оминаючи Web-адаптер.

Як використовувати генератор CommentModel?
```js
import { CommentModel } from '@nan0web/comment/domain'

const model = new CommentModel()
```

## Ліцензія

Як ліцензується? - файл [ISC LICENSE]($pkgURL/blob/main/LICENSE).
