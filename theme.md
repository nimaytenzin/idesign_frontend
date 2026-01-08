# iDesign Frontend Design System

A comprehensive design system for the iDesign application, emphasizing clarity, professional simplicity, and geometric design principles.

## Table of Contents

1. [Color Palette](#1-color-palette)
2. [Typography System](#2-typography-system)
3. [Spacing System](#3-spacing-system)
4. [Component Design Guidelines](#4-component-design-guidelines)
5. [Layout Principles](#5-layout-principles)
6. [Responsive Design Guidelines](#6-responsive-design-guidelines)
7. [Accessibility Guidelines](#7-accessibility-guidelines)
8. [Animation and Transitions](#8-animation-and-transitions)
9. [Implementation Guidelines](#9-implementation-guidelines)
10. [Design Tokens (CSS Custom Properties)](#10-design-tokens-css-custom-properties)
11. [Utility Classes](#11-utility-classes)
12. [Component Patterns](#12-component-patterns)

---

## 1. Color Palette

The iDesign color palette is built around a sophisticated black and white foundation with strategic accent colors for meaningful interactions.

### Core Colors

| Color Role | Color Name | Hex Code | RGB | Usage |
|------------|------------|----------|-----|-------|
| **Primary** | Charcoal Black | `#1A1A1A` | `rgb(26, 26, 26)` | Primary text, navigation headers, form labels |
| **Secondary** | Pure White | `#FFFFFF` | `rgb(255, 255, 255)` | Page backgrounds, card backgrounds, button text on dark |
| **Accent** | Deep Teal | `#00796B` | `rgb(0, 121, 107)` | Primary CTAs, links, active states, progress indicators |
| **Accent Light** | Teal 50 | `#E0F2F1` | `rgb(224, 242, 241)` | Hover states, light backgrounds, success messages |
| **Accent Dark** | Teal 800 | `#00695C` | `rgb(0, 105, 92)` | Hover states on accent elements, focus rings |

### Neutral Scale

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Gray 50** | `#FAFAFA` | `rgb(250, 250, 250)` | Page backgrounds, subtle dividers |
| **Gray 100** | `#F5F5F5` | `rgb(245, 245, 245)` | Card borders, input backgrounds |
| **Gray 200** | `#EEEEEE` | `rgb(238, 238, 238)` | Disabled states, placeholder text |
| **Gray 300** | `#E0E0E0` | `rgb(224, 224, 224)` | Borders, separators |
| **Gray 400** | `#BDBDBD` | `rgb(189, 189, 189)` | Secondary text, icons |
| **Gray 500** | `#9E9E9E` | `rgb(158, 158, 158)` | Helper text, labels |
| **Gray 600** | `#757575` | `rgb(117, 117, 117)` | Body text |
| **Gray 700** | `#616161` | `rgb(97, 97, 97)` | Headings, important text |
| **Gray 800** | `#424242` | `rgb(66, 66, 66)` | Navigation text |
| **Gray 900** | `#212121` | `rgb(33, 33, 33)` | Primary text, headers |

### Semantic Colors

| Purpose | Color | Hex Code | Usage |
|---------|--------|----------|-------|
| **Success** | Green 600 | `#43A047` | Success messages, completed states |
| **Warning** | Orange 600 | `#FB8C00` | Warning messages, pending states |
| **Error** | Red 600 | `#E53935` | Error messages, destructive actions |
| **Info** | Blue 600 | `#1E88E5` | Information messages, help text |

### Color Usage Guidelines

- **Primary (Charcoal Black)**: Use for main headings, important text, and primary UI elements
- **Secondary (White)**: Use for backgrounds and text on dark surfaces
- **Accent (Deep Teal)**: Use sparingly for CTAs, active states, and key interactions
- **Neutral Grays**: Use for hierarchy, borders, and subtle UI elements
- **Semantic Colors**: Use consistently for status indicators and feedback

---

## 2. Typography System

### Font Families

```css
/* Primary Font - Headings & Important Text */
font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Secondary Font - Body Text */
font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace - Code & Data */
font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
```

### Type Scale

| Element | Font | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|------|------|--------|-------------|---------------|--------|
| **H1 Display** | Poppins | 32px (2rem) | 600 | 1.2 | -0.025em | Page titles, hero headings |
| **H1** | Poppins | 28px (1.75rem) | 600 | 1.3 | -0.02em | Section titles |
| **H2** | Poppins | 24px (1.5rem) | 600 | 1.3 | -0.01em | Subsection titles |
| **H3** | Poppins | 20px (1.25rem) | 600 | 1.4 | 0 | Component titles |
| **H4** | Poppins | 18px (1.125rem) | 500 | 1.4 | 0 | Small headings |
| **Body Large** | Roboto | 16px (1rem) | 400 | 1.6 | 0 | Primary body text |
| **Body** | Roboto | 14px (0.875rem) | 400 | 1.5 | 0 | Secondary body text |
| **Body Small** | Roboto | 12px (0.75rem) | 400 | 1.4 | 0.025em | Captions, labels |
| **Button** | Poppins | 14px (0.875rem) | 500 | 1 | 0.025em | Button text |
| **Input Label** | Roboto | 14px (0.875rem) | 500 | 1.4 | 0 | Form labels |

### Text Colors

```css
/* Primary text colors */
.text-primary { color: #1A1A1A; }      /* Main headings, important text */
.text-secondary { color: #616161; }    /* Body text */
.text-muted { color: #9E9E9E; }        /* Helper text, placeholders */
.text-accent { color: #00796B; }       /* Links, accented text */
.text-white { color: #FFFFFF; }        /* Text on dark backgrounds */
.text-success { color: #43A047; }      /* Success messages */
.text-warning { color: #FB8C00; }     /* Warning messages */
.text-error { color: #E53935; }        /* Error messages */
.text-info { color: #1E88E5; }         /* Info messages */
```

### Typography Best Practices

- Use Poppins for headings and UI elements that need emphasis
- Use Roboto for body text and longer content
- Maintain consistent line heights for readability
- Use negative letter spacing for large headings
- Ensure sufficient contrast ratios (minimum 4.5:1 for normal text)

---

## 3. Spacing System

### Base Unit: 4px

All spacing values are multiples of 4px for consistency and visual harmony.

| Token | Value | rem | Usage |
|-------|-------|-----|-------|
| `xs` | 4px | 0.25rem | Icon margins, tight spacing |
| `sm` | 8px | 0.5rem | Small gaps, padding inside buttons |
| `md` | 12px | 0.75rem | Default spacing between elements |
| `lg` | 16px | 1rem | Card padding, form field spacing |
| `xl` | 24px | 1.5rem | Section spacing |
| `2xl` | 32px | 2rem | Large section spacing |
| `3xl` | 48px | 3rem | Page section spacing |
| `4xl` | 64px | 4rem | Hero section spacing |

### Component Spacing Guidelines

```css
/* Card spacing */
.card-padding { padding: 24px; }
.card-gap { gap: 16px; }

/* Form spacing */
.form-field-spacing { margin-bottom: 16px; }
.form-section-spacing { margin-bottom: 32px; }

/* Navigation spacing */
.nav-item-padding { padding: 12px 16px; }
.nav-section-margin { margin-bottom: 24px; }

/* Page spacing */
.page-padding { padding: 24px; }
.section-spacing { margin-bottom: 48px; }
```

### Spacing Best Practices

- Use consistent spacing tokens throughout the application
- Maintain visual rhythm by using multiples of the base unit
- Increase spacing for larger screens
- Use negative margins sparingly and only when necessary

---

## 4. Component Design Guidelines

### 4.1 Buttons

#### Primary Button
```css
.btn-primary {
  background-color: #00796B;
  color: #FFFFFF;
  border: none;
  border-radius: 4px;
  padding: 12px 24px;
  font-family: 'Poppins';
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.025em;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 121, 107, 0.2);
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #00695C;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 121, 107, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 121, 107, 0.2);
}

.btn-primary:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 121, 107, 0.1);
}

.btn-primary:disabled {
  background-color: #BDBDBD;
  cursor: not-allowed;
  transform: none;
}
```

#### Secondary Button
```css
.btn-secondary {
  background-color: transparent;
  color: #00796B;
  border: 1px solid #00796B;
  border-radius: 4px;
  padding: 12px 24px;
  font-family: 'Poppins';
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #E0F2F1;
  border-color: #00695C;
  color: #00695C;
}

.btn-secondary:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 121, 107, 0.1);
}
```

#### Ghost Button
```css
.btn-ghost {
  background-color: transparent;
  color: #616161;
  border: none;
  padding: 12px 16px;
  font-family: 'Poppins';
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  border-radius: 4px;
}

.btn-ghost:hover {
  background-color: #F5F5F5;
  color: #1A1A1A;
}

.btn-ghost:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}
```

#### Button Sizes

```css
/* Small Button */
.btn-sm {
  padding: 8px 16px;
  font-size: 12px;
}

/* Medium Button (Default) */
.btn-md {
  padding: 12px 24px;
  font-size: 14px;
}

/* Large Button */
.btn-lg {
  padding: 16px 32px;
  font-size: 16px;
}
```

### 4.2 Form Elements

#### Input Fields
```css
.input-field {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  font-family: 'Roboto';
  font-size: 14px;
  background-color: #FFFFFF;
  transition: all 0.2s ease;
  color: #1A1A1A;
}

.input-field:focus {
  outline: none;
  border-color: #00796B;
  box-shadow: 0 0 0 3px rgba(0, 121, 107, 0.1);
}

.input-field:disabled {
  background-color: #F5F5F5;
  color: #BDBDBD;
  cursor: not-allowed;
}

.input-field.error {
  border-color: #E53935;
  box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.1);
}

.input-field.success {
  border-color: #43A047;
  box-shadow: 0 0 0 3px rgba(67, 160, 71, 0.1);
}
```

#### Labels
```css
.input-label {
  display: block;
  margin-bottom: 4px;
  font-family: 'Roboto';
  font-size: 14px;
  font-weight: 500;
  color: #1A1A1A;
}

.input-label.required::after {
  content: ' *';
  color: #E53935;
}

.input-helper {
  margin-top: 4px;
  font-family: 'Roboto';
  font-size: 12px;
  color: #9E9E9E;
}

.input-error {
  margin-top: 4px;
  font-family: 'Roboto';
  font-size: 12px;
  color: #E53935;
}
```

#### Textarea
```css
.textarea-field {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  font-family: 'Roboto';
  font-size: 14px;
  background-color: #FFFFFF;
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 100px;
}
```

#### Select/Dropdown
```css
.select-field {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  font-family: 'Roboto';
  font-size: 14px;
  background-color: #FFFFFF;
  transition: all 0.2s ease;
  cursor: pointer;
}

.select-field:focus {
  outline: none;
  border-color: #00796B;
  box-shadow: 0 0 0 3px rgba(0, 121, 107, 0.1);
}
```

#### Checkbox & Radio
```css
.checkbox-field,
.radio-field {
  width: 18px;
  height: 18px;
  accent-color: #00796B;
  cursor: pointer;
}

.checkbox-label,
.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Roboto';
  font-size: 14px;
  color: #1A1A1A;
  cursor: pointer;
}
```

### 4.3 Cards

#### Base Card
```css
.card {
  background-color: #FFFFFF;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
  border-color: #BDBDBD;
}

.card-header {
  padding-bottom: 16px;
  border-bottom: 1px solid #E0E0E0;
  margin-bottom: 16px;
}

.card-title {
  font-family: 'Poppins';
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
  margin: 0;
}

.card-body {
  font-family: 'Roboto';
  font-size: 14px;
  color: #616161;
  line-height: 1.5;
}

.card-footer {
  padding-top: 16px;
  border-top: 1px solid #E0E0E0;
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
```

#### Interactive Card
```css
.card-interactive {
  cursor: pointer;
}

.card-interactive:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}
```

### 4.4 Navigation

#### Sidebar Navigation
```css
.sidebar {
  width: 280px;
  background-color: #FFFFFF;
  border-right: 1px solid #E0E0E0;
  padding: 24px 0;
  height: 100vh;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  color: #616161;
  text-decoration: none;
  transition: all 0.2s ease;
  font-family: 'Roboto';
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.nav-item:hover {
  background-color: #F5F5F5;
  color: #1A1A1A;
}

.nav-item.active {
  background-color: #E0F2F1;
  color: #00796B;
  border-right: 3px solid #00796B;
}

.nav-icon {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  color: inherit;
}
```

#### Top Navigation
```css
.top-nav {
  background-color: #FFFFFF;
  border-bottom: 1px solid #E0E0E0;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-link {
  padding: 8px 16px;
  color: #616161;
  text-decoration: none;
  font-family: 'Roboto';
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  border-radius: 4px;
}

.nav-link:hover {
  background-color: #F5F5F5;
  color: #1A1A1A;
}

.nav-link.active {
  color: #00796B;
  background-color: #E0F2F1;
}
```

### 4.5 Tables

#### Data Table
```css
.data-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #FFFFFF;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.data-table th {
  background-color: #F5F5F5;
  padding: 16px;
  text-align: left;
  font-family: 'Poppins';
  font-size: 14px;
  font-weight: 600;
  color: #1A1A1A;
  border-bottom: 1px solid #E0E0E0;
}

.data-table td {
  padding: 16px;
  border-bottom: 1px solid #F5F5F5;
  font-family: 'Roboto';
  font-size: 14px;
  color: #616161;
}

.data-table tr:hover {
  background-color: #FAFAFA;
}

.data-table tr:last-child td {
  border-bottom: none;
}
```

### 4.6 Modals and Dialogs

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal {
  background-color: #FFFFFF;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #E0E0E0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-family: 'Poppins';
  font-size: 20px;
  font-weight: 600;
  color: #1A1A1A;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #9E9E9E;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background-color: #F5F5F5;
  color: #1A1A1A;
}

.modal-body {
  padding: 24px;
  font-family: 'Roboto';
  font-size: 14px;
  color: #616161;
  line-height: 1.5;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #E0E0E0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
```

### 4.7 Badges and Tags

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  font-family: 'Roboto';
  line-height: 1;
}

.badge-success {
  background-color: rgba(67, 160, 71, 0.1);
  color: #43A047;
  border: 1px solid rgba(67, 160, 71, 0.2);
}

.badge-warning {
  background-color: rgba(251, 140, 0, 0.1);
  color: #FB8C00;
  border: 1px solid rgba(251, 140, 0, 0.2);
}

.badge-error {
  background-color: rgba(229, 57, 53, 0.1);
  color: #E53935;
  border: 1px solid rgba(229, 57, 53, 0.2);
}

.badge-info {
  background-color: rgba(30, 136, 229, 0.1);
  color: #1E88E5;
  border: 1px solid rgba(30, 136, 229, 0.2);
}

.badge-neutral {
  background-color: #F5F5F5;
  color: #616161;
  border: 1px solid #E0E0E0;
}
```

### 4.8 Loading States

```css
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #F5F5F5;
  border-top: 3px solid #00796B;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.skeleton {
  background: linear-gradient(90deg, #F5F5F5 25%, #EEEEEE 50%, #F5F5F5 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 5. Layout Principles

### 5.1 Grid System

- Use a 12-column grid system
- Container max-width: 1200px (can be extended to 1400px for larger screens)
- Gutter width: 24px
- Responsive breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

### 5.2 Page Layout Structure

```
Header (64px height)
├── Logo
├── Navigation
└── User Actions

Main Content
├── Sidebar (280px width) [Optional]
├── Content Area
│   ├── Page Header
│   ├── Breadcrumbs
│   ├── Content Sections
│   └── Actions

Footer
├── Links
├── Copyright
└── Brand Info
```

### 5.3 Container Guidelines

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.container-fluid {
  width: 100%;
  padding: 0 24px;
}

@media (min-width: 1400px) {
  .container {
    max-width: 1400px;
  }
}
```

---

## 6. Responsive Design Guidelines

### 6.1 Breakpoints

```css
/* Mobile First Approach */
.container { max-width: 100%; }

/* Tablet */
@media (min-width: 768px) {
  .container { max-width: 768px; }
}

/* Desktop */
@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

/* Large Desktop */
@media (min-width: 1200px) {
  .container { max-width: 1200px; }
}

/* Extra Large Desktop */
@media (min-width: 1400px) {
  .container { max-width: 1400px; }
}
```

### 6.2 Component Adaptations

- **Navigation**: Collapses to hamburger menu on mobile
- **Cards**: Stack vertically on mobile, grid layout on desktop
- **Tables**: Scroll horizontally on mobile, or convert to card layout
- **Font sizes**: Scale down 10-15% on mobile
- **Spacing**: Reduce padding and margins on mobile (use 75% of desktop values)
- **Images**: Use responsive images with `srcset` and `sizes` attributes

### 6.3 Responsive Typography

```css
/* Mobile */
h1 { font-size: 24px; }
h2 { font-size: 20px; }
h3 { font-size: 18px; }
body { font-size: 14px; }

/* Desktop */
@media (min-width: 1024px) {
  h1 { font-size: 32px; }
  h2 { font-size: 24px; }
  h3 { font-size: 20px; }
  body { font-size: 16px; }
}
```

---

## 7. Accessibility Guidelines

### 7.1 Color Contrast

- Ensure minimum **4.5:1** contrast ratio for normal text (14px and above)
- Ensure minimum **3:1** contrast ratio for large text (18px and above, or 14px bold)
- Use semantic colors consistently
- Never rely solely on color to convey information

### 7.2 Focus States

```css
.focusable:focus {
  outline: 2px solid #00796B;
  outline-offset: 2px;
}

.focusable:focus-visible {
  outline: 2px solid #00796B;
  outline-offset: 2px;
}

/* Remove default outline for mouse users, keep for keyboard */
.focusable:focus:not(:focus-visible) {
  outline: none;
}
```

### 7.3 Screen Reader Support

- Use semantic HTML elements (`<nav>`, `<main>`, `<article>`, `<section>`, etc.)
- Provide descriptive alt text for images
- Use proper heading hierarchy (h1 → h2 → h3, don't skip levels)
- Include ARIA labels where needed (`aria-label`, `aria-labelledby`, `aria-describedby`)
- Use ARIA roles appropriately (`role="button"`, `role="navigation"`, etc.)
- Ensure all interactive elements are keyboard accessible

### 7.4 Keyboard Navigation

- All interactive elements must be focusable
- Tab order should follow visual flow
- Provide visible focus indicators
- Support common keyboard shortcuts (Enter, Space, Escape, Arrow keys)

### 7.5 Accessibility Checklist

- [ ] All images have alt text
- [ ] Color contrast meets WCAG AA standards
- [ ] All interactive elements are keyboard accessible
- [ ] Focus states are clearly visible
- [ ] Form labels are properly associated
- [ ] Error messages are descriptive and accessible
- [ ] Page has proper heading hierarchy
- [ ] ARIA attributes are used where appropriate

---

## 8. Animation and Transitions

### 8.1 Timing Functions

```css
/* Standard easing */
.ease-standard { 
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); 
}

/* Emphasized easing (entering) */
.ease-emphasized { 
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1); 
}

/* Legacy easing (exiting) */
.ease-legacy { 
  transition-timing-function: cubic-bezier(0.4, 0, 1, 1); 
}

/* Decelerated (entering) */
.ease-decelerate {
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
}

/* Accelerated (exiting) */
.ease-accelerate {
  transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
}
```

### 8.2 Duration Guidelines

- **Micro-interactions**: 100-200ms (hover states, button clicks)
- **Component transitions**: 200-300ms (modals, dropdowns)
- **Page transitions**: 300-500ms (route changes, page loads)
- **Complex animations**: 500ms+ (loading states, complex UI changes)

### 8.3 Common Animations

```css
/* Fade In */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Slide Up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Slide Down */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale In */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### 8.4 Animation Best Practices

- Keep animations subtle and purposeful
- Respect user preferences (`prefers-reduced-motion`)
- Use hardware acceleration when possible (`transform`, `opacity`)
- Avoid animating layout properties (`width`, `height`, `margin`, `padding`)
- Test animations on lower-end devices

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. Implementation Guidelines

### 9.1 CSS Architecture

- Use CSS custom properties (CSS variables) for theming
- Follow BEM naming convention for component classes
- Organize styles by component (component-scoped styles)
- Use utility classes for common patterns
- Keep specificity low to avoid override issues

### 9.2 Component Development

1. **Start with mobile design** - Mobile-first approach ensures better responsive behavior
2. **Use design tokens consistently** - Always use tokens from the design system
3. **Test with real content** - Use actual content, not lorem ipsum
4. **Validate accessibility** - Test with screen readers and keyboard navigation
5. **Document variations and states** - Document all component states and variations

### 9.3 Naming Conventions

```css
/* BEM (Block Element Modifier) */
.block {}
.block__element {}
.block--modifier {}
.block__element--modifier {}

/* Examples */
.card {}
.card__header {}
.card--highlighted {}
.card__title--large {}
```

### 9.4 Quality Checklist

- [ ] Follows design system colors
- [ ] Uses correct typography scale
- [ ] Implements proper spacing
- [ ] Accessible color contrast (4.5:1 minimum)
- [ ] Responsive across all breakpoints
- [ ] Consistent with other components
- [ ] Proper focus states
- [ ] Loading and error states defined
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Performance optimized (no layout shifts)

---

## 10. Design Tokens (CSS Custom Properties)

### Complete Token System

```css
:root {
  /* Colors - Core */
  --color-primary: #1A1A1A;
  --color-secondary: #FFFFFF;
  --color-accent: #00796B;
  --color-accent-light: #E0F2F1;
  --color-accent-dark: #00695C;
  
  /* Colors - Neutral Scale */
  --color-gray-50: #FAFAFA;
  --color-gray-100: #F5F5F5;
  --color-gray-200: #EEEEEE;
  --color-gray-300: #E0E0E0;
  --color-gray-400: #BDBDBD;
  --color-gray-500: #9E9E9E;
  --color-gray-600: #757575;
  --color-gray-700: #616161;
  --color-gray-800: #424242;
  --color-gray-900: #212121;
  
  /* Colors - Semantic */
  --color-success: #43A047;
  --color-warning: #FB8C00;
  --color-error: #E53935;
  --color-info: #1E88E5;
  
  /* Colors - Text */
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #616161;
  --color-text-muted: #9E9E9E;
  --color-text-accent: #00796B;
  --color-text-white: #FFFFFF;
  
  /* Typography - Font Families */
  --font-primary: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-secondary: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'Fira Code', 'Monaco', 'Consolas', monospace;
  
  /* Typography - Font Sizes */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;      /* 16px */
  --font-size-lg: 1.125rem;    /* 18px */
  --font-size-xl: 1.25rem;     /* 20px */
  --font-size-2xl: 1.5rem;     /* 24px */
  --font-size-3xl: 1.75rem;    /* 28px */
  --font-size-4xl: 2rem;       /* 32px */
  
  /* Typography - Font Weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Typography - Line Heights */
  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.6;
  
  /* Spacing */
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 0.75rem;   /* 12px */
  --space-lg: 1rem;      /* 16px */
  --space-xl: 1.5rem;    /* 24px */
  --space-2xl: 2rem;     /* 32px */
  --space-3xl: 3rem;     /* 48px */
  --space-4xl: 4rem;     /* 64px */
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 20px 40px rgba(0, 0, 0, 0.3);
  --shadow-focus: 0 0 0 3px rgba(0, 121, 107, 0.1);
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-base: 0.2s ease;
  --transition-slow: 0.3s ease;
  
  /* Z-Index Scale */
  --z-base: 1;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-popover: 600;
  --z-tooltip: 700;
}
```

### Using Design Tokens

```css
/* Example: Using tokens in components */
.my-component {
  background-color: var(--color-secondary);
  color: var(--color-text-primary);
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  font-family: var(--font-secondary);
  font-size: var(--font-size-base);
  transition: all var(--transition-base);
}

.my-component:hover {
  box-shadow: var(--shadow-md);
}
```

---

## 11. Utility Classes

### Text Utilities

```css
/* Text Alignment */
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }

/* Text Colors */
.text-primary { color: var(--color-text-primary); }
.text-secondary { color: var(--color-text-secondary); }
.text-muted { color: var(--color-text-muted); }
.text-accent { color: var(--color-text-accent); }
.text-white { color: var(--color-text-white); }
.text-success { color: var(--color-success); }
.text-warning { color: var(--color-warning); }
.text-error { color: var(--color-error); }
.text-info { color: var(--color-info); }

/* Font Weights */
.font-normal { font-weight: var(--font-weight-normal); }
.font-medium { font-weight: var(--font-weight-medium); }
.font-semibold { font-weight: var(--font-weight-semibold); }
.font-bold { font-weight: var(--font-weight-bold); }

/* Text Truncation */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

### Spacing Utilities

```css
/* Margin */
.m-0 { margin: 0; }
.m-xs { margin: var(--space-xs); }
.m-sm { margin: var(--space-sm); }
.m-md { margin: var(--space-md); }
.m-lg { margin: var(--space-lg); }
.m-xl { margin: var(--space-xl); }

/* Padding */
.p-0 { padding: 0; }
.p-xs { padding: var(--space-xs); }
.p-sm { padding: var(--space-sm); }
.p-md { padding: var(--space-md); }
.p-lg { padding: var(--space-lg); }
.p-xl { padding: var(--space-xl); }

/* Gap */
.gap-xs { gap: var(--space-xs); }
.gap-sm { gap: var(--space-sm); }
.gap-md { gap: var(--space-md); }
.gap-lg { gap: var(--space-lg); }
.gap-xl { gap: var(--space-xl); }
```

### Display Utilities

```css
.block { display: block; }
.inline-block { display: inline-block; }
.inline { display: inline; }
.flex { display: flex; }
.inline-flex { display: inline-flex; }
.grid { display: grid; }
.hidden { display: none; }
```

### Flexbox Utilities

```css
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-start { justify-content: flex-start; }
.justify-end { justify-content: flex-end; }
.flex-wrap { flex-wrap: wrap; }
.flex-1 { flex: 1; }
```

---

## 12. Component Patterns

### 12.1 Product Card Pattern

```html
<div class="product-card">
  <div class="product-card__image">
    <img src="..." alt="Product name" />
    <span class="product-card__badge">In Stock</span>
  </div>
  <div class="product-card__content">
    <div class="product-card__category">Category</div>
    <h3 class="product-card__title">Product Title</h3>
    <p class="product-card__description">Product description...</p>
    <div class="product-card__meta">
      <span class="product-card__material">PLA</span>
      <span class="product-card__weight">0.5kg</span>
    </div>
    <div class="product-card__footer">
      <span class="product-card__price">Nu 12,750</span>
      <button class="btn-primary">View Details</button>
    </div>
  </div>
</div>
```

### 12.2 Filter Sidebar Pattern

```html
<aside class="filter-sidebar">
  <div class="filter-sidebar__header">
    <h3>Filters</h3>
    <button class="btn-ghost">Clear All</button>
  </div>
  <div class="filter-section">
    <label class="input-label">Category</label>
    <select class="select-field">...</select>
  </div>
  <!-- More filter sections -->
</aside>
```

### 12.3 Empty State Pattern

```html
<div class="empty-state">
  <i class="empty-state__icon">...</i>
  <h3 class="empty-state__title">No products found</h3>
  <p class="empty-state__description">
    Try adjusting your filters or search terms.
  </p>
  <button class="btn-primary">Clear Filters</button>
</div>
```

### 12.4 Loading State Pattern

```html
<div class="loading-state">
  <div class="loading-spinner"></div>
  <p>Loading products...</p>
</div>
```

---

## Conclusion

This comprehensive design system ensures consistency, accessibility, and professional quality across all iDesign components while maintaining the geometric, minimalist aesthetic that reflects your brand identity.

### Quick Reference

- **Primary Color**: `#1A1A1A` (Charcoal Black)
- **Accent Color**: `#00796B` (Deep Teal)
- **Primary Font**: Poppins (Headings)
- **Secondary Font**: Roboto (Body)
- **Base Spacing**: 4px
- **Border Radius**: 4px (small), 8px (medium), 12px (large)
- **Transition**: 0.2s ease (standard)

### Getting Started

1. Import the design tokens into your global stylesheet
2. Use utility classes for common patterns
3. Follow component guidelines for custom components
4. Test accessibility and responsiveness
5. Maintain consistency across all components

For questions or contributions, please refer to the project documentation or contact the design team.
