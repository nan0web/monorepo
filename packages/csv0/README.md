# @nan0web/csv0

CSV with FrontMatter (nan0/yaml). 
A pure data format combining the meta-configurability of YAML with the dense tabular layout of CSV.

```csv0
---
layout: table
columns:
  id:
    width: 50px
    align: right
  name:
    label: Full Name
    color: primary
---
id,name,email
1,Yaro,yaro@example.com
2,Bob,bob@example.com
```

## API

```js
import { parseCSV0 } from '@nan0web/csv0'

const { frontMatter, csvBody } = parseCSV0(rawString)
// frontMatter: string (parse with yaml or nan0 parser)
// csvBody: string (parse with fast csv parser)
```
