# Архітектурний план: @nan0web/verse (Децентралізована Мережа)

## 1. Філософія та Фрактальність (Цифрове Місто)
Пакет `@nan0web/verse` є технічним фундаментом для створення "Цифрових Міст" та децентралізованих мереж. 
Його архітектура побудована на принципі **фрактальності**: базові класи настільки універсальні, що з них можна зібрати будь-яку структуру — від простої соціальної мережі (ДоброТворення) до складної освітньої екосистеми (Школа Архітепіки). 

Користувач є єдиним джерелом правди. Платформи лише агрегують ці дані, спираючись на жорсткі контракти.

## 2. Фундаментальні Контракти (Основа Буття)

Ми виділяємо 4 базові форми існування та взаємодії у соціальному просторі:
1. **Хто я?** (`Identity`)
2. **Що я кажу/показую?** (`Post` - Контент)
3. **Що ми робимо разом?** (`Interaction` - Обмін/Дія)
4. **Як ми пов'язані?** (`Connection` - Контекст/Роль)

### 2.1 Identity (Суб'єкт)
Маніфест особистості (`.well-known/nan0web/social.md`).
```javascript
export class Identity extends Model {
  static did = { type: 'string', help: 'Decentralized Identifier' };
  static public_keys = { type: 'string[]', default: [] };
  
  static name = { type: 'string', errorRequired: 'Name is required' };
  static declaration = { type: 'string', help: 'Declaration of Will' };
  
  static wallets = { type: 'string[]', help: 'Crypto/Fiat wallets' };
  static endpoints = { type: 'object', help: 'Matrix / Inbox URLs' };
}
```

### 2.2 Post (Контент та Медіа)
Фрактальний підхід до контенту. Може бути як коротким твітом, так і великою статтею з галереєю.
```javascript
export class Post extends Model {
  static id = { type: 'string' }; 
  static title = { type: 'string' };
  static tags = { type: 'string[]', default: [] }; 
  static published_at = { type: 'string' };
  
  static content = { type: 'string', help: 'Markdown content' };
  
  // Універсальне медіа: фото, відео, галереї
  static media = { 
    type: 'object[]', 
    help: 'Array of media { type: "image"|"video"|"link", url, caption }',
    default: [] 
  };
}
```

### 2.3 Interaction: Service & Event (Взаємодія)
Фундаментальний обмін або подія в часі.
```javascript
export class Interaction extends Model {
  static title = { type: 'string' };
  static tags = { type: 'string[]', default: [] };
}

export class Service extends Interaction {
  static type = { type: 'string', validate: val => ['offer', 'request'].includes(val) }; 
  static currency = { type: 'string', default: 'WILLNI' }; // Доменні валюти
}

export class Event extends Interaction {
  static starts_at = { type: 'string' };
  static location = { type: 'string' }; // Фізична чи URL
}
```

### 2.4 Connection / Role (Контекстуальний статус)
Ця модель вирішує проблему статусів (викладач тут, студент там). Вона визначає зв'язок `Identity` з певною `Спільнотою`, `Проектом` або `Іншою людиною`.
```javascript
export class Connection extends Model {
  static target_did = { type: 'string', help: 'DID of the Community, Course, or Person' };
  static context = { type: 'string', help: 'Context ID (e.g., "school_of_architepics")' };
  static role = { type: 'string', help: 'Role in this context: "teacher", "student", "member", "founder"' };
  static attributes = { type: 'object', default: {}, help: 'Context-specific data (e.g., progress)' };
}
```

## 3. Фрактальне Розширення (Наслідування)
Завдяки цим 4 стовпам, будь-яка платформа може побудувати свою екосистему.
Наприклад, **Школа Архітепіки** бере базовий `Post` і розширює його до `Lesson` (Урок), бере `Connection` і перетворює на `Enrollment` (Зарахування на курс).

```javascript
import { Post, Connection } from '@nan0web/verse';

// Урок - це просто розширений Пост
export class Lesson extends Post {
  static homework_required = { type: 'boolean', default: false };
}

// Зарахування - це розширений Зв'язок (Студент -> Курс)
export class Enrollment extends Connection {
  static progress_percentage = { type: 'number', default: 0 };
}
```

## 4. Доменні Валюти та Відкладена Доставка
- **Валюти:** Файл `/.well-known/valuta.md` на домені спільноти описує правила.
- **Доставка:** `Identity.endpoints` використовується для Matrix-сумісного спілкування.
