---
title: Documentation
lang: en
---
# @nan0web/ui

🏴󠁧󠁢󠁥󠁮󠁧󠁿 [English](./README.md) | 🇺🇦 [Українською](./docs/uk/README.md)

<!-- %PACKAGE_STATUS% -->

A lightweight, agnostic UI framework designed with the **nan0web philosophy**
— one application logic, many UI implementations.

This library provides core classes and utilities for building structured user interfaces.
It supports:

- Messaging (Input/Output)
- Forms with validation
- Progress tracking
- Component rendering
- View management with Frame rendering
- App structure with core and user apps

Built to work in sync or async, terminal-based or web-based apps,
focusing on type safety, minimalism, and pure JavaScript design.

## Table of Contents

- [Installation](#installation)
- [Concepts & Architecture](#concepts--architecture)
  - [Intent-Based Communication (OLMUI)](#intent-based-communication-olmui)
  - [Model-as-Schema](#model-as-schema)
  - [Forms](#forms)
  - [View & Frames](#view--frames)
  - [Application & CoreApp](#application--coreapp)
- [Testing (TDD+)](#testing-tdd)
  - [Scenario Testing (v1.12+)](#scenario-testing-v112)
  - [Story Testing (.nan0)](#story-testing-nan0-spec-files)
- [Master IDE](#master-ide-component-sandbox)
- [Philosophy & Economy](./en/philosophy-economy.md)
- [Legacy Architecture v1](./en/legacy/v1.md)

## Installation

How to install with npm?
```bash
npm install @nan0web/ui
```

How to install with pnpm?
```bash
pnpm add @nan0web/ui
```

How to install with yarn?
```bash
yarn add @nan0web/ui
```

## Concepts & Architecture

### Intent-Based Communication (OLMUI)

UI communication is built around **Intents**. Application logic yields intents (ask, show, result) interpreted by environment adapters.

For more details, see:
- [Philosophy & Economy](./en/philosophy-economy.md)
- [Architecture Guide](./en/architecture.md)
- [Legacy v1 Documentation (UiMessage)](./en/legacy-v1.md)

### Model-as-Schema

`UiForm` supports field definitions, data management, and schema validation.
Every form includes a title, fields, and current state.

Field types include:

- `text`
- `email`
- `number`
- `select`
- `checkbox`
- `textarea`

How to define and validate a UiForm?
```js
import { UiForm } from '@nan0web/ui'
const form = new UiForm({
	title: 'Contact Form',
	fields: [
		FormInput.from({ name: 'email', label: 'Email Address', type: 'email', required: true }),
		FormInput.from({
			name: 'message',
			label: 'Your Message',
			type: 'textarea',
			required: true,
		}),
	],
	state: {
		email: 'invalid-email',
		message: 'Hello!',
	},
})
const { isValid, errors } = form.validate()
console.info(Object.keys(errors).length) // ← 1
console.info(errors.email) // ← Invalid email format
```
### Components

Components render data as frame-ready output.

- `Welcome` – greets user by name
- `Process` – shows progress bar and time

How to render the Welcome component?
```js
import { Welcome } from '@nan0web/ui'
const frame = Welcome({ user: { name: 'Alice' } })
const firstLine = frame[0].join('')
console.info(firstLine) // ← Welcome Alice!
```
### View Manager

`View` combines components and renders frames.

Every view has:

- Locale – formatted text, numbers, currency
- StdIn / StdOut – input/output streams
- Frame – output buffer with visual properties

How to render frame with View?
```js
import { View } from '@nan0web/ui'
const view = new View()
view.render(1)(['Hello, world'])
console.info(String(view.frame)) // ← "\rHello, world"
```
### Frame Rendering

`Frame` manages visual rendering with width and height limits.
Useful for fixed-size terminals or UI blocks.

Render methods:

- `APPEND` – adds content after previous frame
- `REPLACE` – erases and replaces full frame area
- `VISIBLE` – renders only visible part of frame

How to create a Frame with fixed size?
```js
import { Frame } from '@nan0web/ui'
const frame = new Frame({
	value: [['Frame content']],
	width: 20,
	height: 5,
	renderMethod: Frame.RenderMethod.APPEND,
})
const rendered = frame.render()
console.info(rendered.includes('Frame content')) // ← true
```
### Domain Models (v1.9.0)

v1.9.0 introduces a comprehensive set of domain models for layout and components.
These models follow the **Model-as-Schema** pattern.

#### Layout Models
- `HeaderModel` — title, logo, navigation actions
- `FooterModel` — copyright, version, social links
- `HeroModel` — prominent call-to-action

#### Component Models
- `PricingModel` — plans with features and prices
- `CommentModel` & `TestimonialModel` — social proof
- `StatsModel` — data visualizations
- `TimelineModel` — event history

How to use the new Header and Hero models?
```js
import { Model } from '@nan0web/ui'
const { HeaderModel, HeroModel } = Model
const header = new HeaderModel({
	title: 'NaN•Web',
	logo: '/logo.svg',
	actions: [{ title: 'Docs', href: '/docs' }],
})
const hero = new HeroModel({
	title: 'One Logic — Many UI',
	actions: [{ title: 'Get Started', href: '/start' }],
})
console.info(header.title) // ← NaN•Web
console.info(hero.actions[0].title) // ← Get Started
```
### Intent Generators (v1.11.0)

From v1.11.0, Intent creators are standard named functions generating
strict interactions (ask, progress, show, render, result).

- `ask(field, schema)` — requests input from the environment.
- `progress(message)` — updates a visual loader.
- `show(message, level, data)` — displays a notification (replaces deprecated `log`).
- `render(component, props)` — renders a specific component view.
- `result(data)` — ends the model execution cleanly.

How to use Intent generators? (v1.11.0)
```js
import { ask, show, result } from '@nan0web/ui'
const nameIntent = ask('name', { help: 'Your name' })
const msgIntent = show('Processing...', 'info')
const endIntent = result({ ok: true })
```
### Testing UI

Core unit-tested to ensure stability in different environments.

All components, adapters, and models are designed to be testable
with minimal setup.

How to test UI components with assertions?
```js
import { Welcome } from '@nan0web/ui'
const output = Welcome({ user: { name: 'Test' } })
console.info(output) // ← Welcome Test!
```
### Master IDE (Component Sandbox)

The Master IDE (OlmuiInspector) provides a unified environment for testing and documenting
web components across platforms. It supports:

- **NaN0 Spec** — a concise YAML-based shorthand for declaring component variations.
- **OlmuiInspector** — unified UI for exploring component models and props.
- **Live Preview** — real-time rendering of component states.
- **i18n UI** — fully localized interface (UK/EN) for global developers.
- **Theme Editor** — Bootstrap-like CSS variable system with live preview.

It follows the **Olmui** core pattern: *One Logic — Many UI* (same manifest powers both CLI and Web).

#### Theme Editor (CSS Variables)

Professional-grade theming with live preview. Supports:

- **Palette**: primary, secondary, success, warning, danger, info
- **Geometry**: border-radius (sm/md/lg/pill/circle), spacing (sm/md/lg)
- **Type-safe inputs**: `type="color"` for colors, number inputs for dimensions

#### Component Rendering Architecture

The IDE handles data transformation between YAML models and web components:

- **Table**: `rows[][] + columns[]` → `data[]` (array of objects)
- **Tree**: `data` → `items` mapping with 4-level taxonomy
- **Markdown**: Raw markdown → HTML via `_md2html()` converter
- **ProgressBar**: Tag alias (`ui-progress-bar` → `ui-progress`), variant colors
- **LangSelect**: `string[]` → `{code,title}[]` conversion
- **Hyphenated props**: Auto `camelCase` conversion (`show-label` → `showLabel`)

#### NaN0 Spec (YAML)

Concise format for defining variations:

How to define a component variation using NaN0 Spec?
```yaml
- Button: Primary
  $variant: brand
  $outline: true
```

#### Documentation Site

The IDE includes an auto-generated documentation site.
HTML pages are generated from `ide.html` template via `generate-pages.js`:

- Per-language pages (`/uk/Data/Table.html`, `/en/Feedback/Alert.html`)
- SEO-optimized with `<title>` and `<meta>` per component
- Category-based URL routing (`/Data/`, `/Feedback/`, `/Forms/`, `/Actions/`, `/System/`)
- i18n navbar with `data-i18n` attributes

How to run the documentation site?
```bash
npm run docs:dev
```

## Playground Demos

The library includes rich playground demos:

- [Registration Form](./play/registration.form.js)
- [Currency Exchange](./play/currency.exchange.js)
- [Mobile Top-up](./play/topup.telephone.js)
- [Language Selector](./play/language.form.js)

Run to explore live functionality:

How to run the playground?
```bash
# Clone repository and run playground
git clone https://github.com/nan0web/ui.git
cd ui
npm install
npm run play
```

## API Documentation

Detailed API docs are available in each class JSDoc.
Explore:

- [Messages](./src/core/Message/)
- [Forms](./src/core/Form/)
- [Stream](./src/core/Stream.js)
- [Components](./src/Component/)
- [View](./src/View/)
- [App](./src/App/)
- [Models](./src/Model/)

## Project Architecture & Specs

How the universal block spec is designed? - [check Universal Blocks Spec (`project.md`)](./project.md)

## Contributing

How to contribute? - [check here](./CONTRIBUTING.md)

## License

How to license ISC? - [check here](./LICENSE)
