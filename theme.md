# iDesign Frontend Design System

A comprehensive design system for the iDesign application, emphasizing clarity, professional simplicity, and geometric design principles.

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
```

## 3. Spacing System

### Base Unit: 4px

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
```

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
```

#### Secondary Button
```css
.btn-secondary {
  background-color: transparent;
  color: #00796B;
  border: 1px solid #00796B;
  border-radius: 4px;
  padding: 12px 24px;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: #E0F2F1;
  border-color: #00695C;
}
```

#### Ghost Button
```css
.btn-ghost {
  background-color: transparent;
  color: #616161;
  border: none;
  padding: 12px 16px;
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  background-color: #F5F5F5;
  color: #1A1A1A;
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
```

### 4.4 Navigation

#### Sidebar Navigation
```css
.sidebar {
  width: 280px;
  background-color: #FFFFFF;
  border-right: 1px solid #E0E0E0;
  padding: 24px 0;
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
}

.modal {
  background-color: #FFFFFF;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #E0E0E0;
}

.modal-title {
  font-family: 'Poppins';
  font-size: 20px;
  font-weight: 600;
  color: #1A1A1A;
  margin: 0;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #E0E0E0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
```

## 5. Layout Principles

### 5.1 Grid System
- Use a 12-column grid system
- Container max-width: 1200px
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

## 6. Responsive Design Guidelines

### 6.1 Breakpoints
```css
/* Mobile First Approach */
.container { max-width: 100%; }

@media (min-width: 768px) {
  .container { max-width: 768px; }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1200px) {
  .container { max-width: 1200px; }
}
```

### 6.2 Component Adaptations
- Navigation collapses to hamburger menu on mobile
- Cards stack vertically on mobile
- Table scrolls horizontally on mobile
- Font sizes scale down 10-15% on mobile

## 7. Accessibility Guidelines

### 7.1 Color Contrast
- Ensure minimum 4.5:1 contrast ratio for normal text
- Ensure minimum 3:1 contrast ratio for large text
- Use semantic colors consistently

### 7.2 Focus States
```css
.focusable:focus {
  outline: 2px solid #00796B;
  outline-offset: 2px;
}
```

### 7.3 Screen Reader Support
- Use semantic HTML elements
- Provide alt text for images
- Use proper heading hierarchy
- Include ARIA labels where needed

## 8. Animation and Transitions

### 8.1 Timing Functions
```css
/* Standard easing */
.ease-standard { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }

/* Emphasized easing (entering) */
.ease-emphasized { transition-timing-function: cubic-bezier(0, 0, 0.2, 1); }

/* Legacy easing (exiting) */
.ease-legacy { transition-timing-function: cubic-bezier(0.4, 0, 1, 1); }
```

### 8.2 Duration Guidelines
- Micro-interactions: 100-200ms
- Component transitions: 200-300ms
- Page transitions: 300-500ms
- Complex animations: 500ms+

## 9. Implementation Guidelines

### 9.1 CSS Architecture
- Use CSS custom properties for theming
- Follow BEM naming convention
- Organize styles by component
- Use utility classes for common patterns

### 9.2 Component Development
1. **Start with mobile design**
2. **Use design tokens consistently**
3. **Test with real content**
4. **Validate accessibility**
5. **Document variations and states**

### 9.3 Quality Checklist
- [ ] Follows design system colors
- [ ] Uses correct typography scale
- [ ] Implements proper spacing
- [ ] Accessible color contrast
- [ ] Responsive across devices
- [ ] Consistent with other components
- [ ] Proper focus states
- [ ] Loading and error states defined

## 10. Design Tokens (CSS Custom Properties)

```css
:root {
  /* Colors */
  --color-primary: #1A1A1A;
  --color-secondary: #FFFFFF;
  --color-accent: #00796B;
  --color-accent-light: #E0F2F1;
  --color-accent-dark: #00695C;
  
  /* Typography */
  --font-primary: 'Poppins', sans-serif;
  --font-secondary: 'Roboto', sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.75rem;
  --font-size-4xl: 2rem;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 0.75rem;
  --space-lg: 1rem;
  --space-xl: 1.5rem;
  --space-2xl: 2rem;
  --space-3xl: 3rem;
  --space-4xl: 4rem;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 20px 40px rgba(0, 0, 0, 0.3);
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-base: 0.2s ease;
  --transition-slow: 0.3s ease;
}
```

This comprehensive design system ensures consistency, accessibility, and professional quality across all iDesign components while maintaining the geometric, minimalist aesthetic that reflects your brand identity.