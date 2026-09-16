# 📐 Рецепт: Model-as-Schema & Чистий i18n Суверенітет

> **Концепція:** One Logic — Multiple User Interfaces (OLMUI)  
> **Пакет:** `@nan0web/types`, `@nan0web/ui`, `@nan0web/i18n`  
> **Статус:** Канонічний Стандарт

---

## 🏛 1. Принцип Модельного i18n Суверенітету

1. **Модель — це технічне креслення англійською мовою**:
   - Усі ключі схеми, валідатори, назви змінних та коментарі пишуться ВИКЛЮЧНО англійською.
2. **СУВОРО ЗАБОРОНЕНО інлайнити об'єкти локалей**:
   - Жодних `{ uk: '...', en: '...' }` всередині JS-класів чи полів моделі!
   - Модель не знає, на скільки мов перекладатиметься застосунок.
3. **Усі системні мета-налаштування моделі починаються з `$`**:
   - `static $collection` — системне ім'я колекції в БД / Payload CMS (string, англ.)
   - `static $alias` — технічний псевдонім моделі (string, англ.)
   - `static $slug` — системний слаг для маршрутизації (string, англ.)
   - `static $title` — ім'я поля екземпляра, яке слугує заголовком рядка (string, англ.)
   - `static $singular` — назва сутності в однині для UI (англійський ключ, напр. `'Account'`)
   - `static $plural` — назва сутності в множині для UI (англійський ключ, напр. `'Accounts'`)

---

## 📋 2. Еталонний Приклад Доменної Моделі

```javascript
import { Model } from '@nan0web/types'

/**
 * Account Model — Канонічний зразок Model-as-Schema з $ метаданими
 */
export class AccountModel extends Model {
	// ─── 1. Мета-налаштування Моделі ($ prefix) ───
	static $collection = 'accounts'
	static $alias = 'account'
	static $slug = 'account'
	static $title = 'title'
	static $singular = 'Account'
	static $plural = 'Accounts'

	// ─── 2. Схема Полів для Генератора Форм та CMS ───
	/** @type {import('@nan0web/ui').FieldSchema} */
	static title = {
		help: 'Account title',
		type: 'string', // тип не обовʼязковий, якщо default має чіткий тип
		required: true,
		default: '',
	}

	/** @type {import('@nan0web/ui').FieldSchema} */
	static iban = {
		help: 'International Bank Account Number',
		type: 'string',
		required: true,
		errorInvalid: 'Invalid IBAN format',
		validate: (val) => /^UA\d{27}$/.test(val) || AccountModel.iban.errorInvalid,
	}

	/** @type {import('@nan0web/ui').FieldSchema} */
	static balance = {
		help: 'Current balance',
		type: 'number',
		default: 0,
	}

	// ─── 3. JSDoc-типізація інстансу (БЕЗ class fields) ───
	/**
	 * @param {Partial<AccountModel>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Account title */ this.title
		/** @type {string} International Bank Account Number */ this.iban
		/** @type {number} Current balance */ this.balance
	}
}
```

---

## 🌍 3. Як працює зв'язка з `@nan0web/i18n`

1. **Екстракція (`extract.js`)**:
   Екстрактор `@nan0web/i18n` аналізує модель і збирає ключі:
   - Метадані сутності: `$singular`, `$plural`
   - Метадані полів: `help*`, `label*`, `title*`, `placeholder*`, `message*`, `error*`
2. **Словники локалей**:
   Усі переклади зберігаються ізольовано в `.nan0` словниках:
   - `data/uk/_/t.nan0`:
     ```yaml
     Account: 'Рахунок'
     Accounts: 'Рахунки'
     Account title: 'Назва рахунку'
     International Bank Account Number: 'Номер рахунку IBAN'
     Invalid IBAN format: 'Некоректний формат IBAN'
     Current balance: 'Поточний залишок'
     ```
   - `data/en/_/t.nan0`:
     ```yaml
     Account: 'Account'
     Accounts: 'Accounts'
     Account title: 'Account title'
     International Bank Account Number: 'IBAN'
     Invalid IBAN format: 'Invalid IBAN format'
     Current balance: 'Current balance'
     ```
3. **Адаптер Payload CMS або API**:
   Генерує колекції автоматично.
   Якщо зовнішній рушій вимагає мультимовний об'єкт для адмінки:
   ```javascript
   labels: {
       singular: { uk: t(Model.$singular, 'uk'), en: t(Model.$singular, 'en') },
       plural: { uk: t(Model.$plural, 'uk'), en: t(Model.$plural, 'en') },
   }
   ```
   **Ця трансформація здійснюється генератором адаптера, а не розробником у моделі!**
