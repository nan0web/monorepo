# @nan0web/vault

> **Autonomous Steganographic Password & Secret Vault** на базі архітектури NaN0Web Model-as-App та суверенного протоколу безпеки.

---

## 🎯 Призначення

`@nan0web/vault` — це незалежне, локальне, суверенне сховище секретів, облікових даних і приватних ключів:
- **Zero-Knowledge**: жодні дані не надсилаються на зовнішні хмарні сервери;
- **Автентифікована криптографія**: scrypt KDF (256-bit key derivation) + AES-256-GCM / ChaCha20-Poly1305 з унікальними одноразовими векторами ініціалізації (IV) та тегами автентичності;
- **Zero Data-Loss Guard**: атомарне збереження у віртуальній базі даних `@nan0web/db` через swap-файли та автоматичний **Rolling Backup** (до 5 попередніх версій `.bak`);
- **Model-as-Schema**: декларативний опис та валідація сутностей (`VaultModel`, `SecretItemModel`, `VaultHeaderModel`) без процедурного спагеті.

---

## 🚀 Встановлення

```bash
pnpm add @nan0web/vault
```

---

## 💻 Швидкий старт (API)

```javascript
import { VaultModel } from '@nan0web/vault'
import DB from '@nan0web/db-fs'

const db = new DB()
const vault = new VaultModel(
  { path: 'secrets.vault' },
  { db }
)

// Встановлення майстер-пароля
vault.setPassphrase('master-passphrase-phrase')

// Додавання секрету
vault.addSecret({
  id: 'github',
  title: 'GitHub Personal Token',
  username: 'architechnomag',
  secret: 'ghp_exampleToken12345',
})

// Збереження (атомарний запис + rolling backup)
await vault.save()

// Читання та розшифрування
await vault.load()
const item = vault.getSecret('github')
console.log(item.secret)
```

---

## ✍️ Підпис документів (`nan0vault sign`)

CLI `nan0vault sign <file.md>` конвертує Markdown у PDF (з печаткою та QR-посиланням) і підписує його через PGP (`.pdf.asc` / `.pdf.sig`) та опційно QES/КЕП (`.pdf.p7s`).

Налаштування зберігається у файлі `_.nan0` (із каскадним успадкуванням через `@nan0web/db`):

```yaml
sign:
  assets:
    stamp:
      src: assets/stamp.svg
      width: 200px
      height: 200px
  qr:
    base_url: https://ipfs.io/ipfs/
  pgp:
    key_id: "YOUR_GPG_KEY_ID"
    armor: true
  qes:
    enabled: false
    provider: cli
    command: "eu-sign -sign {input} {output}"
    format: p7s
  output: ""
```

Запуск у директорії з документом:

```bash
nan0vault sign document.md
```

Результат: `document.pdf`, `document.pdf.asc` (PGP) та за увімкненого `qes.enabled` — `document.pdf.p7s`.

---

## 📦 Релізи та розробка

Проєкт розробляється суворо за [PM-as-Code Release Protocol](./releases/README.md).

- **Поточний реліз:** [v0.2.0](./releases/0/2/v0.2.0/task.md)
- **Контрактні тести:** `pnpm run release:spec`
- **Комплексна перевірка:** `pnpm run test:all`
