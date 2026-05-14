# @nan0web/mail

A tiny, type-safe mail helper built on **nodemailer**. It
provides ready-made classes for addresses, attachments,
e-mail composition and a tiny DB helper.

| Package name                                      | [Status](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв) | Documentation                                                                                                                                           | Test coverage | Features                           | Npm version |
| ------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------- | ----------- |
| [@nan0web/mail](https://github.com/nan0web/mail/) | 🟢 `98.0%`                                                                            | 🧪 [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/mail/blob/main/README.md)<br />[Українською 🇺🇦](https://github.com/nan0web/mail/blob/main/docs/uk/README.md) | 🟡 `89.4%`    | ✅ d.ts 📜 system.md 🕹️ playground | —           |

## Installation

How to install with npm?

```bash
npm install @nan0web/mail
```

How to install with pnpm?

```bash
pnpm add @nan0web/mail
```

How to install with yarn?

```bash
yarn add @nan0web/mail
```

## Usage – Address

Simple value object for e-mail, telephone or any address.

How to create an Address from a string?

```js
import { Address } from '@nan0web/mail'
const addr = Address.from('John Doe <john@example.com>')
console.info(String(addr))
// John Doe <john@example.com>
```

\*/
How to create an Address from an object?

```js
import { Address } from '@nan0web/mail'
const addr = Address.from({ address: 'test@example.com', name: 'Test User' })
console.info(String(addr))
// Test User <test@example.com>
```

## Usage – Attachment

Build a Nodemailer attachment, placeholders are replaced
by the `replace` function.

How to create an Attachment and format it for Nodemailer?

```js
import { Attachment } from '@nan0web/mail'
const att = new Attachment({
  filename: 'invoice-{{id}}.pdf',
  path: './invoices/{{id}}.pdf',
  contentDisposition: 'inline',
})
const formatted = att.formatForNodemailer({ id: '123' })
console.info(JSON.stringify(formatted))
// {"filename":"invoice-123.pdf","path":"./invoices/123.pdf","contentDisposition":"inline"}
```

## Usage – Email composition

Create an `Email` object, add attachments and render
it for Nodemailer.

How to build an Email with placeholders and attachments?

```js
import { Email, Attachment } from '@nan0web/mail'
const mail = new Email({
  subject: 'Invoice {{id}}',
  html: '<p>Dear {{name}}, see attached.</p>',
  from: 'Billing <billing@example.com>',
  to: 'Customer <customer@example.com>',
  attachments: [
    {
      filename: 'invoice-{{id}}.pdf',
      path: './invoices/{{id}}.pdf',
    },
  ],
})
const formatted = mail.formatForNodemailer({ id: '001', name: 'Alice' })
console.info(JSON.stringify(formatted))
// {"from":"Billing <billing@example.com>","to":"Customer <customer@example.com>","cc":"","bcc":"","subject":"Invoice 001","html":"<p>Dear Alice, see attached.</p>","attachments":[{"filename":"invoice-001.pdf","path":"./invoices/001.pdf","contentDisposition":"attachment"}]}
```

## Usage – Target

Handle multiple recipients: `to`, `cc`, `bcc`.

How to create a Target with multiple recipients?

```js
import { Target, Address } from '@nan0web/mail'
const target = new Target()
target.add('alice@example.com', 'to')
target.add('bob@example.com', 'cc')
target.add('carol@example.com', 'bcc')
const formatted = target.formatForNodemailer()
console.info(JSON.stringify(formatted))
// {"to":"<alice@example.com>","cc":"<bob@example.com>","bcc":"<carol@example.com>"}
```

\*/
How to create Target from object?

```js
import { Target } from '@nan0web/mail'
const target = Target.from({
  to: ['alice@example.com', 'david@example.com'],
  cc: 'bob@example.com',
})
const formatted = target.formatForNodemailer()
console.info(JSON.stringify(formatted))
// {"to":"<alice@example.com>, <david@example.com>","cc":"<bob@example.com>","bcc":""}
```

## Usage – MailDB transformation

-
- Turn a raw record into an enriched object.
  \*/
  How to transform data with MailDB?

```js
import { MailDB } from '@nan0web/mail'
const db = new MailDB()
const source = { name: 'John Smith', gender: 1, mail: 'john@example.com' }
const config = {
  formattedName: [(item) => item.name.split(' ')[0]],
  genderText: [(item) => (item.gender === 1 ? 'male' : 'female')],
  email: { $ref: 'mail' },
  certificateNo: [(item) => '001'],
}
const result = await db.transform(source, config, {})
console.info(JSON.stringify(result))
// {"formattedName":"John","genderText":"male","email":"john@example.com","certificateNo":"001"}
```

## Usage – Message

Build a message with sender, recipient and attachments.

How to create and use a Message?

```js
import { Message, Attachment } from '@nan0web/mail'
const msg = new Message({
  body: 'test message',
  from: 'sender@example.com',
  to: 'recipient@example.com',
  attachments: [new Attachment({ filename: 'note.txt', content: 'Hello!' })],
})
console.info(String(msg))
// 2025-10-28T10:09:11.143Z test message
console.info(String(msg.from))
// <sender@example.com>
console.info(String(msg.to))
// <recipient@example.com>
console.info(JSON.stringify(msg.attachments))
// [{"filename":"note.txt","content":"Hello!","path":"","href":"","httpHeaders":"","contentType":"","contentDisposition":"attachment","cid":"","encoding":"","headers":"","raw":""}]
```

## Usage – createMailer

Helper that returns a Nodemailer transport.

How to create a Nodemailer transport with createMailer?

```js
import { createMailer } from '@nan0web/mail'
const transport = createMailer({ jsonTransport: true })
console.info(transport.constructor.name) // ← Mail
```

## Usage – send mail

The `mail` function composes everything and sends it.

How to send an email using the `mail` helper?

```js
import { mail, Email } from '@nan0web/mail'
class DummyMailer {
  from
  subject
  html
  attachments
  async sendMail(msg) {
    Object.assign(this, msg)
    return { ok: true }
  }
}
const dummy = new DummyMailer()
const email = new Email({
  subject: 'Hi {{user}}',
  html: '<p>Hello {{user}}</p>',
  from: 'Me <me@example.com>',
  to: 'You <you@example.com>',
})
const data = { user: 'Bob' }
const info = await mail(email, data, { mailer: dummy })
console.info(info)
// { ok: true }
```

## API reference

### Address

- **Properties** `address`, `name`, `type`

- **Methods** `toString()`, `toObject()`, static `from()`

### Attachment

- **Properties** `filename`, `content`, `path`, `href`, `httpHeaders`, `contentType`, `contentDisposition`, `cid`, `encoding`, `headers`, `raw`

- **Methods** `formatForNodemailer()`, static `from()`

### Email

- **Properties** `subject`, `html`, `from`, `target`, `attachments`, `text`, `style`, `dir`, `fields`

- **Methods** `attach()`, `formatForNodemailer()`, static `from()`

### Target

- **Methods** `add()`, `addObject()`, `formatForNodemailer()`, `toString()`, static `from()`

### Message

- **Properties** `body`, `time`, `from`, `to`, `dir`, `attachments`

- **Methods** `attach()`, static `from()`

### MailDB

- **Methods** `transform()`, `loadFromReference()`, static `findNestedElement()`

### createMailer

Returns a Nodemailer transport.
@param {object} trasportConfig The nodemailer config

### mail

Sends a composed email.
@param {Email} email Email instance
@param {object} data Data to fill placeholders
@param {object} opts Options like mailer and htmlEol

All exported symbols are defined

## Java•Script

Uses `d.ts` files for autocompletion

## Playground

Run a quick experiment.

How to run the playground script?

## Contributing

How to contribute? - [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

How to use license? - [LICENSE](./LICENSE)
