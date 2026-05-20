# 🏗️ Як створити новий компонент у NaN•Web?

Ця інструкція описує повний життєвий цикл створення, інтеграції та верифікації нового UI-компонента відповідно до архітектурних стандартів **OLMUI (One Logic, Many UI)** та **Zero-Hardcode**.

---

## 🏛️ Життєвий цикл компонента (3 кроки)

Кожен компонент у NaN•Web складається з трьох ізольованих шарів:
1. **Domain Model (Модель)** — описує бізнес-схему та валідацію (`packages/ui/src/domain/components/`).
2. **UI Renderer (Представлення)** — реалізація інтерфейсу для конкретної платформи (React, Lit, CLI).
3. **Play & Test (Пісочниця та Тести)** — візуальне зварювання та snapshot-тести (`*.play.jsx` + `*.test.jsx`).

---

## 🛠️ Покроковий приклад: Створення компонента `Alert`

Створимо компонент сповіщення (`Alert`), який показує повідомлення з певним статусом (`success`, `warning`, `danger`).

### Крок 1: Опис Доменної Моделі (Model-as-Schema)

Створіть файл доменної моделі в `packages/ui/src/domain/components/AlertModel.js`. Вона описує, які пропси очікує компонент, їхні типи та дефолтні значення:

```javascript
import { Model } from '@nan0web/types'

/**
 * Model-as-Schema для компонента Alert.
 */
export class AlertModel extends Model {
	static type = {
		help: 'Тип сповіщення (візуальний статус)',
		default: 'success',
		options: ['success', 'warning', 'danger'],
	}

	static message = {
		help: 'Текст повідомлення',
		default: 'Операцію виконано успішно',
		type: 'string',
	}

	static dismissible = {
		help: 'Чи можна закрити повідомлення',
		default: false,
		type: 'boolean',
	}

	/**
	 * @param {Partial<AlertModel> | Record<string, any>} data Вхідні дані
	 * @param {object} [options] Опції
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {'success'|'warning'|'danger'} Тип */ this.type
		/** @type {string} Повідомлення */ this.message
		/** @type {boolean} Можливість закриття */ this.dismissible
	}
}
```

---

### Крок 2: Реалізація UI Рендерера

#### Варіант А: React компонент (`packages/ui-react`)
Створіть файл рендерера в `packages/ui-react/src/components/atoms/Alert.jsx`:

```jsx
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useUI } from '../../context/UIContext.jsx'

export default function Alert({ type = 'success', message, dismissible = false, onClose }) {
	const { theme } = useUI()
	const [visible, setVisible] = useState(true)

	if (!visible) return null

	// Використання семантичних токенів дизайну (Zero-Hardcode)
	const styles = {
		padding: 'var(--spacing-md, 1rem)',
		borderRadius: 'var(--radius-md, 0.375rem)',
		marginBottom: 'var(--spacing-sm, 0.5rem)',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		border: '1px solid transparent',
		// Динамічний колір з токенів
		backgroundColor: `var(--color-${type}-light, #e2f0d9)`,
		color: `var(--color-${type}-dark, #385723)`,
		borderColor: `var(--color-${type}-border, #c5e1b5)`,
	}

	return (
		<div style={styles} role="alert">
			<span>{message}</span>
			{dismissible && (
				<button 
					onClick={() => {
						setVisible(false)
						if (onClose) onClose()
					}}
					style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
				>
					×
				</button>
			)}
		</div>
	)
}

Alert.propTypes = {
	type: PropTypes.oneOf(['success', 'warning', 'danger']),
	message: PropTypes.string.isRequired,
	dismissible: PropTypes.bool,
	onClose: PropTypes.func,
}
```

---

### Крок 3: Зварювання (Interface Welding) та Створення Play-файлу

Play-файли є візуальними пісочницями. Вони демонструють різні сценарії використання компонента в ізольованому середовищі.

Створіть файл пісочниці `apps/3rdparty/industrialbank/cards/src/ui/react-bootstrap/components/Alert.play.jsx` (або у відповідному `play` каталозі вашого додатку):

```jsx
import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import Alert from './Alert.jsx'
import { AlertModel } from '@nan0web/ui'

export default function AlertPlay() {
	// Створюємо моделі для різних станів
	const successAlert = new AlertModel({
		type: 'success',
		message: 'Ваш платіж успішно проведено!',
		dismissible: true,
	})

	const dangerAlert = new AlertModel({
		type: 'danger',
		message: 'Помилка авторизації. Спробуйте ще раз.',
		dismissible: false,
	})

	return (
		<Container className="py-4">
			<h3>Сценарії компонента Alert</h3>
			<Row className="mt-3">
				<Col>
					{/* Успішний варіант */}
					<Alert 
						type={successAlert.type} 
						message={successAlert.message} 
						dismissible={successAlert.dismissible}
						onClose={() => console.log('Success alert closed')}
					/>

					{/* Варіант помилки */}
					<Alert 
						type={dangerAlert.type} 
						message={dangerAlert.message} 
						dismissible={dangerAlert.dismissible}
					/>
				</Col>
			</Row>
		</Container>
	)
}
```

---

## 🎨 Важливі правила стилізації (Zero-Hardcode)

Щоб ваші компоненти виглядали чудово та автоматично підтримували зміну тем (світла/темна), дотримуйтесь наступних правил:

1. **Жодних фіксованих кольорів**: Замість `color: '#333'` завжди використовуйте змінні токенів:
   * `var(--color-text-primary)` — основний текст
   * `var(--color-surface)` — фон контейнерів
   * `var(--color-primary)` — акцентні елементи/кнопки
2. **Жодних жорстких відступів**: Замість `margin: '15px'` використовуйте сітку відступів:
   * `var(--spacing-xs)` (4px)
   * `var(--spacing-sm)` (8px)
   * `var(--spacing-md)` (16px)
   * `var(--spacing-lg)` (24px)
3. **Автоматична генерація скріншотів**:
   Після додавання play-файлу обов'язково запустіть тест-аудитор:
   ```bash
   pnpm run test:web-gallery
   ```
   Це автоматично згенерує візуальні зліпки (скріншоти) компонента для всіх підтримуваних роздільних здатностей і тем (світлої/темної) у директорії `snapshots/`.
