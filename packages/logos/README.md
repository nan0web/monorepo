# @nan0web/logos

Sovereign Logic Hub: Intent, Observer, and Identity models.

## Installation

```bash
npm install @nan0web/logos
```

## Usage

```js
import { HumanName, HumanGender, HumanContact } from '@nan0web/logos'

const name = HumanName.from(['Alice', 'Developer'])
const gender = HumanGender.from('female')
const contact = HumanContact.from('mailto:alice@example.com')
```

## Subpath Exports

- `@nan0web/logos` — all domain exports (`intent`, `observer`, `identity`)
- `@nan0web/logos/identity` — `Human`, `HumanName`, `HumanGender`, `HumanContact`, `I`, `We`
- `@nan0web/logos/intent` — `LanguageIntentModel`, `LanguageIntentMessage`, `LanguageIntentRegexAgent`
- `@nan0web/logos/observer` — `G0d`, `Observation`, `Observer`, `Phenomenon`, `Potencial`, `Rea0ity`, `Rea1ity`

## License

ISC
