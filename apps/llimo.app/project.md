# 🚀 LLiMo (Language Living Models)

## 🎯 1. Доменна Область та Ідея

**LLiMo (Language Living Models)** — це гібридна платформа, що складається з **безкоштовного AI-чату** для генерації коду та **платного Автономного Конвеєра (Workflow Engine)**, здатного автономно парсити специфікації (Markdown) і перетворювати їх на готові додатки. 

Ключовим нововведенням є **Agnostic Proxy Commands (`@llimo`)**. Вони дозволяють агенту видавати єдині універсальні абстрактні інструкції, які LLiMo Framework автоматично перекладає в специфічні CLI-команди залежно від середовища (JS, Python, Go, Rust тощо).

---

## 🏗 2. Архітектура Agnostic Workflow Pipeline (`@llimo`)

Щоб LLiMo міг генерувати повноцінні додатки на **будь-якій** мові програмування, ядром виконання є проксі `@llimo`. Маркдаун-файли пайплайну (`seed.md`, `adapt.md`) ніколи не хардкодять мову. Агент завжди використовує абстракцію.

### 🌐 Матриця Трансляцій Мультимовних Команд

У таблиці нижче наведено, як CLI адаптер перетворюватиме універсальну команду в специфічну для обраного стеку (TypeScript, Python, C++, Go, Java, Rust, PHP тощо):

| Абстракція LLiMo | JavaScript / TS (pnpm) | Python (Pip) | Rust (Cargo) | Go | Java (Maven) | C++ (CMake) | PHP (Composer) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `@llimo install` | `pnpm install` | `pip install -r req.txt`| `cargo build` | `go mod tidy` | `mvn install` | `cmake .` | `composer install` |
| `@llimo add <pkg>` | `pnpm add <pkg>` | `pip install <pkg>` | `cargo add <pkg>`| `go get <pkg>` | `mvn add <pkg>` | `vcpkg install` | `composer require` |
| `@llimo test` | `pnpm test` | `pytest` | `cargo test` | `go test ./...` | `mvn test` | `ctest` | `phpunit` |
| `@llimo test:unit` | `pnpm run test:unit` | `pytest tests/unit` | `cargo test --lib` | `go test -short` | `mvn test` | `ctest -R Unit` | `phpunit --testsuite Unit` |
| `@llimo test:stories`| `pnpm run test:stories`| `pytest --stories` | `cargo test --doc` | `go test -v ./stories` | `mvn test -Dtest=*Story` | `ctest -R Story` | `phpunit --testsuite Stories` |
| `@llimo test:e2e` | `pnpm run test:e2e` | `playwright test` | `cargo test --test`| `go test -tags=e2e` | `mvn verify` | `ctest -R E2E`| `phpunit --testsuite E2E`|
| `@llimo update` | `pnpm update` | `pip install --upgrade` | `cargo update` | `go get -u` | `mvn versions:up` | `apt update` | `composer update` |
| `@llimo build` | `pnpm run build` | `pep517 build` | `cargo build --release`| `go build` | `mvn package` | `make` | `php box build` |
| `@llimo local` | `pnpm run local` | `python main.py` | `cargo run` | `go run main.go`| `mvn exec:java` | `./app` | `php -S localhost` |
| `@llimo deploy` | `pnpm run deploy` | `fab deploy` | `cargo clippy && push`| `go build -tags prod`| `mvn deploy` | `make install` | `dep deploy` |
| `@llimo release:close`| `pnpm run release:close`| `python setup.py bump` | `cargo run --bin release` | `go run release.go` | `mvn release:clean`| `make release` | `auto-changelog` |

### Принцип Роботи Адаптера
Локальний `WorkflowCLIAdapter` динамічно визначає середовище:
1. Шукає сигнатурні файли (`package.json`, `Cargo.toml`, `go.mod`, `pom.xml`, `requirements.txt`).
2. Встановлює "активну екосистему".
3. Під час зустрічі кроку (`@llimo test`) відбувається підстановка відповідної команди з матриці. Відбувається лінійна виконання з логуванням у `~/.llimo/chats/...`

---

## 🔒 3. Стратегія Монетизації та IP Захисту

Оскільки LLiMo є оркестратором маркдаун-пайплайнів, виникає фундаментальна проблема: якщо дозволити клієнту виконувати пропрієтарні `Workflows` через локальні LLM, він зможе елементарно перехопити наші ідеальні промпти, читаючи лог запитів до своєї моделі. Тому стратегія монетизації базується на наступних принципах:

1. **AI-Чат (`llimo chat`)** — залишається **free** (Bring-Your-Own-Key або Local OS Models).
2. **Автономний Конвеєр (`llimo workflow`)** — платна SaaS-підписка (Business / Enterprise).
   - **Cloud Orchestration (Закритий IP):** Для захисту нашого *Know-How*, преміум-генератори воркфлоу ніколи не віддаються клієнту. Всі запити до LLM формулюються і виконуються на нашому захищеному сервері `api.llimo.app`. Локальний CLI-клієнт отримує по веб-сокету лише безпечні інтенції (напр. `"виконай @llimo test"`), і відправляє назад логи терміналу. Користувач фізично позбавлений доступу до системних промптів агентів.
   - **Continuous Value:** Ми беремо гроші не лише за приховування коду, а за постійну еволюцію. Розробка ПЗ стрімко змінюється, і підписка гарантує, що клієнт завжди має доступ до ідеально відкаліброваних та протестованих 0HCnAI `user-stories` пайплайнів.
