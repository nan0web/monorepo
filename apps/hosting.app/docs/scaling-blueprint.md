# План масштабування та горизонтальної синхронізації NaN•Panel

Цей документ визначає вимоги до заліза (Hardware), архітектуру баз даних, API та стратегії синхронізації при масштабуванні платформи від 10 000 до 1 000 000 000 користувачів.

---

## 📊 Матриця масштабування: від 10К до 1В користувачів

| Користувачі (Scale) | Середній RPS | Залізо (Hardware) | База Даних (DB Tier) | Рівень API (Bun/Node) | Горизонтальна Синхронізація |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **10K** | ~1 000 | 1 vCPU, 1GB RAM, SSD | db-fs (YAML/JSON) + SQLite | Єдиний процес Bun (Gateway) | Не потрібна (один інстанс) |
| **100K** | ~10 000 | 2 vCPU, 2GB RAM, SSD | db-fs (YAML/JSON) + SQLite (WAL) | Clustered Bun (2 воркери) | Не потрібна (один інстанс) |
| **1M** | ~100 000 | 8 vCPU, 16GB RAM, NVMe (2 ноди) | PostgreSQL (Single Node) + Redis | Clustered Bun (8 воркери, PM2) | Master-Replica для БД, сесії у JWT/Cookie |
| **10M** | ~1M | Кластер (10+ нод, Load Balancer) | PostgreSQL Cluster (Master + 3 Replicas) + Redis | Kubernetes Bun Pods (HPA) | Redis Sentinel (сесії), Redis Pub/Sub (інвалідація кешу) |
| **100M** | ~10M | Multi-region Cluster (Anycast DNS) | CockroachDB / Citus DB (Distributed SQL) | Global Bun Edge Nodes | Message Broker (Kafka / RabbitMQ), Redis Cluster |
| **1B** (Planet-scale) | ~100M | Global Edge Compute (CDN-Edge) | Spanner / ScyllaDB / DynamoDB (Multi-Region Write) | WASM / Bun Serverless на Edge | CRDTs (Conflict-Free Replicated Data Types), Event Sourcing |

---

## 🛠️ Опис архітектурних стратегій за рівнями

### 1. Рівень Бази Даних (Database Scaling)
* **До 100К користувачів (SQLite):** SQLite у режимі WAL (Write-Ahead Logging) є ідеальним рішенням. Читання відбувається паралельно без блокувань, а база зберігається в одному файлі.
* **1М–10М (PostgreSQL + Redis):** Перехід на повноцінний SQL сервер з Master-Replica архітектурою. Читання масштабується на репліки, а Redis кешує важкі запити.
* **100М+ (Distributed SQL / CRDTs):** Використання гео-розподілених баз даних (CockroachDB чи ScyllaDB), які підтримують запис у кількох регіонах одночасно з автоматичним вирішенням конфліктів.

### 2. Рівень API та маршрутизації (Gateway Layer)
* **До 100К (Single Gateway):** Один процес Bun перенаправляє запити через динамічний імпорт (`import()`) за заголовком `Host`, економлячи RAM.
* **1М–10М (Kubernetes / Auto-scaling):** Трафік балансується за допомогою HAProxy або Caddy Load Balancer на групу контейнерів Bun.js, які автоматично масштабуються залежно від навантаження CPU.
* **100М+ (Edge Serverless):** Додатки виконуються на найближчій до користувача Edge-ноді (Cloudflare Workers або власна мережа Caddy/Bun Edge нод).

### 3. Механізм горизонтальної синхронізації та очищення кешу
* **Локальний кеш (10К–100К):** Запити `PURGE` надсилаються локально на `localhost:2019`.
* **Розподілений кеш (1M+):** При оновленні даних на Master-вузлі, подія відправляється через **Redis Pub/Sub** або **Kafka** на всі Edge-ноди Caddy для миттєвого скидання кешу (`Invalidate-Tags`) на кожному сервері одночасно.
