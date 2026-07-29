---
description: '🏭 Конвеєр Продакшн Розгортання, Безпеки (CORS, Obfuscation) та Субдоменів'
---

# 🏭 `production-deployment-and-security`

> **Призначення:** Стандарт розгортання в Продакшн середовищі для проєктів екосистеми NaN0Web / EA Ukraine. Визначає правила ізоляції Sandbox, Admin, Public версій, конфігурацію CORS, обфускацію адмін-субдоменів та захист від потенційних загроз.

---

## 1. Архітектурне Зонування Середовищ (Isolation Strategy)

| Середовище | Розгортання (Local Dev) | Розгортання (Production) | Авторизація / Доступ |
| :--- | :--- | :--- | :--- |
| **Public Site** | `localhost:3000/` | `eaukraine.eu` | Публічний доступ (CDN / SSG) |
| **Sandbox / UI** | `localhost:3000/sandbox` | `sandbox.eaukraine.eu` (або `ui.eaukraine.eu`) | HTTP Basic Auth або обмеження IP |
| **Admin Panel** | `localhost:3000/admin` | `${ADMIN_SUBDOMAIN}.eaukraine.eu` | Обов'язкова 2FA / Session Token |

---

## 2. Обфускація Адмінки (Admin Subdomain Obfuscation)

Для захисту від автоматизованих сканерів та ботів адреса адмін-панелі **не повинна бути захардкоджена** у публічному роутингу.

### Конфігурація через `.env.production`:

```env
# Змінні оточення для конфігурації субдоменів та роутингу
PUBLIC_DOMAIN=eaukraine.eu
ADMIN_SUBDOMAIN=adm-sec-x942k
SANDBOX_SUBDOMAIN=ui-gallery-p82
ALLOWED_ORIGINS=https://eaukraine.eu,https://adm-sec-x942k.eaukraine.eu
```

### Динамічний Middleware (Next.js / Express):

```javascript
// src/middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
  const host = request.headers.get('host') || ''
  const url = request.nextUrl.clone()
  
  const adminSubdomain = process.env.ADMIN_SUBDOMAIN || 'admin'
  const sandboxSubdomain = process.env.SANDBOX_SUBDOMAIN || 'sandbox'

  // Ізоляція AdminPanel за кастомним субдоменом
  if (host.startsWith(adminSubdomain)) {
    url.pathname = `/admin${url.pathname}`
    return NextResponse.rewrite(url)
  }

  // Захист Sandbox від індексації та публічного доступу в Prod
  if (host.startsWith(sandboxSubdomain)) {
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('authorization')
      if (!authHeader) {
        return new NextResponse('Authentication required', {
          status: 401,
          headers: { 'WWW-Authenticate': 'Basic realm="Sandbox Restricted"' },
        })
      }
    }
    url.pathname = `/sandbox${url.pathname}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}
```

---

## 3. Налаштування CORS (Cross-Origin Resource Sharing)

Всі API та DB-еліксири заблоковані за замовчуванням. Дозволяються виключно домени з білого списку:

```javascript
// src/lib/cors.js
export function applyCorsHeaders(res, origin) {
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',')
  
  if (allowed.includes(origin)) {
    res.headers.set('Access-Control-Allow-Origin', origin)
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.headers.set('Access-Control-Allow-Credentials', 'true')
  }
}
```

---

## 4. Конфігурація Nginx / Reverse Proxy

Еталонний фрагмент конфігурації Nginx для розгортання:

```nginx
# Public Application
server {
    server_name eaukraine.eu www.eaukraine.eu;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Obfuscated Admin Subdomain
server {
    server_name adm-sec-x942k.eaukraine.eu;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Custom-Admin-Auth "1";
    }
}
```

---

## 5. Чеклист Релізу в Продакшн (Definition of Done)

1. [ ] Додано змінні `ADMIN_SUBDOMAIN` та `ALLOWED_ORIGINS` у секретне конфігурування.
2. [ ] Перевірено відсутність заголовків `X-Powered-By`.
3. [ ] Перевірено закриття Sandbox на фоні пошукових роботів (`robots.txt` розширено тегом `Disallow: /sandbox`).
4. [ ] Виконано локальний аудит тестами: `pnpm run test:all`.
