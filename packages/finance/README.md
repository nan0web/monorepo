# @nan0web/finance

Financial logic, formatting, and calculations for nan0web platforms.
This package provides reliable tools for banking, credit, and tax calculations,
with a focus on precision and local requirements (like Ukraine taxes).

## Installation

How to install?
```bash
pnpm add @nan0web/finance
```

## Formatting Utilities

### `formatAmount(value, currency, locale, options)`
Formats numbers, arrays, or {min, max} objects as currency strings or ranges.

How to format currency range?
```js
const range = { min: 1000, max: 5000 }
const formatted = formatAmount(range, 'UAH', 'uk-UA')
// Example: "1 000,00 ₴ — 5 000,00 ₴"
```
### `formatRate(value, locale)`
Formats fractional numbers as percentage strings.

How to format percentage?
```js
const rate = 0.125
const formatted = formatRate(rate, 'en-US')
// Example: "12.5%"
```
## Calculations

### `calcCommission(amount, rules)`
Calculates commission based on fixed rates or complex rules (min/max).

How to calculate commission with limit?
```js
const rules = { value: 1, maxAmount: 50 } // 1%, max 50
const res = calcCommission(10000, rules)
// 1% of 10000 is 100, but max is 50
```
## Ukraine-specific Taxes

### `UATaxCalculator`
Calculates Personal Income Tax (18%) and Military Tax (1.5%).

How to calculate UA taxes?
```js
const calc = new UATaxCalculator()
const details = calc.getDetails(10000)
```
## Loan Engine

### `LoanEngine.generateSchedule(amount, rate, term, options)`
Generates amortization schedule for annuity or differential payments.

How to generate loan schedule?
```js
const schedule = LoanEngine.generateSchedule(10000, 0.12, 12, { gracePeriod: 2 })
```