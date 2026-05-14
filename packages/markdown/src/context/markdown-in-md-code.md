#### `./README.md`

````md
# NaN•MarkDown

Markdown parser for nanoweb.

## Features

- Parses standard Markdown syntax into structured objects
- Supports headings, paragraphs, lists, code blocks, links, images, blockquotes, tables, and more
- Extensible element types for custom Markdown structures
- Converts Markdown to HTML
- Written in pure JavaScript with JSDoc typing

## Usage

```js
import Markdown from '@nan0web/markdown'

const md = new Markdown()
const elements = md.parse('# Hello World\n\nThis is a paragraph.')
const html = md.stringify()
```
````

## Extended Syntax

Extended syntax elements like task lists, fenced code blocks, and tables are supported through custom element classes.

## API

### `Markdown`

Main parser class.

#### `parse(text: string): MDElement[]`

Parses Markdown text into an array of `MDElement` objects.

#### `stringify(interceptor?: Function): string`

Converts parsed elements to HTML string. Optionally accepts an interceptor function to customize rendering.

### `MDElement`

Base class for all Markdown elements.

#### `toHTML(): string`

Renders the element as HTML.

#### `toString(): string`

Renders the element as Markdown.

## Development

Run tests with `npm test`.

Build types with `npm run build`.

```
#.

```
