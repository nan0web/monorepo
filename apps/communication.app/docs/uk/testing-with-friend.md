# Як протестувати `@nan0web/communication.app` з другом за 1000 км

Ця інструкція дозволяє двом людям на різних комп’ютерах запустити живий діалог через Git-репозиторій: надсилати повідомлення, переглядати історію дня та кристалізувати задачі в `todo.md`.

---

## Крок 1. Підготовка спільного Git-репозиторію

1. Створіть порожній приватний репозиторій (наприклад, на GitHub/GitLab/Gitea): `my-family-chat`.
2. Обидва учасники клонують його на свій комп’ютер:
   ```bash
   git clone git@github.com:<org>/my-family-chat.git
   cd my-family-chat
   ```

---

## Крок 2. Встановлення та запуск CLI `nan0com`

Встановіть пакет глобально (або у проєкті), після чого команда `nan0com` буде доступна усюди:

```bash
pnpm add -g @nan0web/communication.app
nan0com --help
```

*(Усередині монорепозиторію `nan.web` також можна зробити `pnpm link --global` з папки `apps/communication.app`.)*

---

## Крок 3. Ініціалізація контактів (`7i/`)

Кожен учасник реєструє себе у канонічному колі `we/7i`:

**Ви:**
```bash
nan0com init --author soul:yaro --circle 7i
```

**Друг (за 1000 км):**
```bash
nan0com init --author soul:friend --circle 7i
```

---

## Крок 4. Живий діалог (Надсилання та перегляд)

> **Структура шляху `--repo`:** `we/<circle>/<chat-name>`, де `we/7i` — це коло (папка контактів і чатів близького кола), а `family` (або `friend-chat`) — назва конкретного чату всередині цього кола.

1. **Надіслати повідомлення:**
   ```bash
   nan0com send --repo we/7i/family --author soul:yaro --text "Привіт! Перевіряємо зв'язок на 1000 км."
   ```
   Повідомлення збережеться у `we/7i/family/chat/YYYY/MM/DD/<ts>-soul-yaro.md` та автоматично оновиться денний індекс `README.md`.

   > **Примітка про авторство (`v0.1.0`):** на цьому етапі `--author soul:yaro` передається як текстовий ідентифікатор (автентичність на транспортному рівні забезпечує ваш Git SSH/GPG-ключ). Криптографічний підпис кожного повідомлення через `@nan0web/vault` (`Master soulId` + `Device Subkey`) буде додано у `v0.2.0`.

2. **Синхронізувати через Git (безконфліктно):**
   Кожен пише у свою гілку або пушить у спільний репозиторій:
   ```bash
   git add .
   git commit -m "chat: message from soul:yaro"
   git push origin HEAD:refs/heads/peers/soul-yaro
   ```
   Щоб отримати повідомлення друга:
   ```bash
   git fetch origin
   git merge origin/peers/soul-friend --no-edit
   ```
   Оскільки файли мають унікальні часові мітки та імена `<ts>-<peer>.md`, конфліктів злиття не виникає.

3. **Переглянути діалог за день:**
   ```bash
   nan0com view --repo we/7i/family --date 2026-11-20
   ```

---

## Крок 5. Кристалізація повідомлення у задачу (`crystallize`)

Щоб перетворити повідомлення з чату на задачу у `todo.md` зі збереженням авторства та посилання `$ref`:

```bash
nan0com crystallize \
  --msgUri we/7i/family/chat/2026/11/20/<ts>-soul-yaro.md \
  --targetDocUri we/7i/family/todo.md \
  --kind todo
```

У файлі `we/7i/family/todo.md` з’явиться рядок:
```markdown
- [ ] Привіт! Перевіряємо зв'язок на 1000 км. [author:soul:yaro] [$ref:we/7i/family/chat/2026/11/20/<ts>-soul-yaro.md]
```
