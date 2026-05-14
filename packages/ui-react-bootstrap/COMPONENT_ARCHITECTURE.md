# Component Architecture Split

## Overview

This document describes the separation of concerns between general-purpose UI components (in `@nan0web/ui-react-bootstrap`) and domain-specific banking components (in `apps/ibank.ua`).

## General Components (ui-react-bootstrap)

These components are **NOT** proprietary to the bank and can be reused across any project:

### Organisms

- **Header.Header** - Navigation bar with logo, menu, and language selector
- **Footer.Footer** - Site footer with links and contact info
- **Promo** - Hero carousel with slides, images, and call-to-action buttons

### Molecules

- **Loading** - Spinner/loading indicator
- **Heading** - Page titles with optional description
- **Accordion** - Collapsible content sections
- **Blog** - Blog post listing with cards
- **Contacts** - Contact information display

### Atoms

- **Telephone** - Clickable phone number link
- **Email** - Clickable email address link
- **Address** - Semantic address markup
- **Icon** - Icon component using react-icons (Font Awesome)

### Forms

- **Button** - Styled button with variants
- **Input** - Text input, textarea, etc.
- **Typography** - Text styles (body, heading, caption)
- **Card** - Content card wrapper
- **Modal** - Modal dialog

---

## Banking-Specific Components (ibank.ua)

These components remain **proprietary** to the bank and contain business logic:

### Bank Domain

- **Bank.CurrencySlider** - Currency exchange rates slider
- **Bank.Currencies** - Full currency exchange table
- **Bank.Calculator.CurrencyCalc** - Currency conversion calculator
- **Bank.Calculator.DepositCalc** - Deposit calculator with interest rates
- **Bank.Calculator.LoanCalc** - Loan payment calculator
- **Bank.Calculator.AmountRange** - Range slider for amounts
- **Bank.Calculator.DepositCalculations** - Deposit result displays
- **Bank.Calculator.DepositControls** - Deposit calculator controls

### Bank-Specific UI

- **DepartmentsModal** - Branch/ATM locator modal
- **Regions** - Regional branch listings
- **Order** - Credit card/service order forms
- **SignIn** - Customer authentication

### Bank Content

- **Apps** (if bank-specific) - Banking app showcases
- **Calculator** - Generic wrapper for bank calculators

---

## Migration Rules

When deciding whether a component belongs in `ui-react-bootstrap` or `ibank.ua`:

### ✅ Move to ui-react-bootstrap if:

- Component has NO business logic (pure presentation)
- Component is reusable across different industries
- Component relies only on styling and layout
- Examples: buttons, forms, layouts, navigation, footers

### ❌ Keep in ibank.ua if:

- Component contains financial calculations
- Component uses banking-specific models (Cards, Deposits, Credits)
- Component integrates with bank APIs or services
- Component displays proprietary business data
- Examples: calculators, currency converters, product catalogs

---

## Technical Notes

### Document Context

All components can access the `document` object via `useUI()`:

```jsx
import { useUI } from '@nan0web/ui-react'

const MyComponent = () => {
  const { document, t, uri } = useUI()
  const nav = document?.nav
  const contact = document?.contact
  // ...
}
```

### Prop Fallbacks

Components support both explicit props and document context:

```jsx
<Header nav={customNav} /> // Explicit
<Header.Header nav={true} /> // Use document.nav
<Header.Header /> // Auto-detect from document
```

### Naming Conventions

- **Atoms**: Single-purpose, no children (Button, Icon)
- **Molecules**: Composed of atoms (Contacts, Blog)
- **Organisms**: Complex, multi-part (Header, Footer)

### Accessibility (A11y) & Keyboard Navigation

All UI components **must** support native keyboard interaction. This includes:

- Proper `tabIndex` attributes for focusable elements (`tabIndex={0}` for custom interactive elements).
- Handling keyboard events (`onKeyDown`, `onKeyUp`) for actions like `Enter`, `Space`, and standard Arrow keys navigation.
- Focus visibility and clear outline handling for screen readers and keyboard users.

---

## Future Considerations

- **Apps.List**: Currently bank-specific, but could become generic "app showcase" if decoupled from banking
- **SearchModal**: Could be general if search backend is abstracted
- **FeedbackForm**: Already general, pending migration
- **GDPRConsent**: Already general, pending migration
