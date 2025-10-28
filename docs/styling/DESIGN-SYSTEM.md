# Design System

Complete design system documentatie voor Nieuws Scraper Frontend.

## 📋 Inhoudsopgave

- [Kleuren](#kleuren)
- [Typografie](#typografie)
- [Spacing](#spacing)
- [Borders & Radius](#borders--radius)
- [Shadows](#shadows)
- [Breakpoints](#breakpoints)
- [Z-Index](#z-index)
- [Animations](#animations)

## 🎨 Kleuren

### Color Palette

Ons kleurenschema is gebaseerd op CSS variabelen voor consistentie en dark mode ondersteuning.

#### Primary Colors

```css
/* Light Mode */
--primary: 221.2 83.2% 53.3%;          /* Hoofdkleur - Blauw */
--primary-foreground: 210 40% 98%;    /* Tekst op primary */

/* Dark Mode */
--primary: 217.2 91.2% 59.8%;         /* Lichter blauw voor dark mode */
```

**Gebruik:**
```tsx
className="bg-primary text-primary-foreground"
```

#### Background Colors

```css
/* Light Mode */
--background: 0 0% 100%;              /* Wit */
--foreground: 222.2 84% 4.9%;         /* Bijna zwart */

/* Dark Mode */
--background: 222.2 84% 4.9%;         /* Donkergrijs */
--foreground: 210 40% 98%;            /* Bijna wit */
```

**Gebruik:**
```tsx
className="bg-background text-foreground"
```

#### Card Colors

```css
--card: 0 0% 100%;                    /* Wit */
--card-foreground: 222.2 84% 4.9%;    /* Tekst kleur */
```

**Gebruik:**
```tsx
className="bg-card text-card-foreground"
```

#### Semantic Colors

```css
/* Secondary */
--secondary: 210 40% 96.1%;           /* Lichtgrijs */
--secondary-foreground: 222.2 47.4% 11.2%;

/* Muted (voor minder belangrijke content) */
--muted: 210 40% 96.1%;
--muted-foreground: 215.4 16.3% 46.9%;

/* Accent (voor hover states) */
--accent: 210 40% 96.1%;
--accent-foreground: 222.2 47.4% 11.2%;

/* Destructive (voor errors/delete) */
--destructive: 0 84.2% 60.2%;         /* Rood */
--destructive-foreground: 210 40% 98%;
```

### Bron Kleuren

Specifieke kleuren per nieuwsbron voor herkenbaarheid:

```tsx
const sourceColors = {
  'nu.nl': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'ad.nl': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'nos.nl': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'telegraaf.nl': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'volkskrant.nl': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
};
```

## ✍️ Typografie

### Font Family

```css
font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Import in layout:**
```tsx
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
```

### Font Sizes

| Name | Class | Size | Line Height | Gebruik |
|------|-------|------|-------------|---------|
| xs | `text-xs` | 12px | 16px | Kleine labels, badges |
| sm | `text-sm` | 14px | 20px | Body text klein |
| base | `text-base` | 16px | 24px | Default body text |
| lg | `text-lg` | 18px | 28px | Subheadings |
| xl | `text-xl` | 20px | 28px | Headings H3 |
| 2xl | `text-2xl` | 24px | 32px | Headings H2 |
| 3xl | `text-3xl` | 30px | 36px | Headings H1 |
| 4xl | `text-4xl` | 36px | 40px | Hero headings |

### Font Weights

```tsx
font-normal    // 400 - Body text
font-medium    // 500 - Emphasized text
font-semibold  // 600 - Subheadings
font-bold      // 700 - Headings
```

### Typografie Voorbeelden

```tsx
// Page Title
<h1 className="text-4xl font-bold">Laatste Nieuws</h1>

// Section Title
<h2 className="text-2xl font-semibold">Statistieken</h2>

// Card Title
<h3 className="text-xl font-semibold leading-tight">Article Title</h3>

// Body Text
<p className="text-base text-muted-foreground">Content hier...</p>

// Small Text
<span className="text-sm text-muted-foreground">Metadata</span>

// Label
<label className="text-sm font-medium">Filter</label>
```

## 📏 Spacing

Gebaseerd op 4px grid systeem (Tailwind default):

| Value | Pixels | Class | Gebruik |
|-------|--------|-------|---------|
| 0 | 0px | `p-0, m-0` | Reset |
| 1 | 4px | `p-1, m-1` | Zeer klein |
| 2 | 8px | `p-2, m-2` | Klein (badges, tags) |
| 3 | 12px | `p-3, m-3` | Medium klein |
| 4 | 16px | `p-4, m-4` | Standard (default padding) |
| 6 | 24px | `p-6, m-6` | Medium (cards) |
| 8 | 32px | `p-8, m-8` | Large (sections) |
| 12 | 48px | `p-12, m-12` | Extra large |

### Spacing Patterns

```tsx
// Container spacing
<div className="container mx-auto px-4 py-8">

// Card padding
<div className="p-6">

// Section spacing
<section className="space-y-6">

// Grid gap
<div className="grid gap-6">

// Flex gap
<div className="flex gap-4">
```

## 🔲 Borders & Radius

### Border Width

```tsx
border      // 1px
border-2    // 2px
border-4    // 4px
```

### Border Radius

```css
--radius: 0.5rem;  /* 8px - default */
```

| Class | Value | Gebruik |
|-------|-------|---------|
| `rounded-sm` | 4px | Small elements |
| `rounded-md` | 6px | Medium (buttons, inputs) |
| `rounded-lg` | 8px | Large (cards) |
| `rounded-xl` | 12px | Extra large |
| `rounded-full` | 9999px | Circles, pills |

### Border Colors

```tsx
border-border     // Default border
border-input      // Input borders
border-primary    // Emphasized borders
```

## ✨ Shadows

```tsx
shadow-sm    // Subtle shadow (hover states)
shadow       // Default shadow (cards)
shadow-md    // Medium shadow (elevated cards)
shadow-lg    // Large shadow (modals, dropdowns)
shadow-xl    // Extra large shadow (tooltips)
```

**Voorbeelden:**
```tsx
// Card
<div className="rounded-lg border bg-card shadow-sm">

// Elevated Card (hover)
<div className="rounded-lg border bg-card shadow-sm hover:shadow-lg transition-shadow">
```

## 📱 Breakpoints

Responsive breakpoints volgen Tailwind defaults:

| Breakpoint | Min Width | Class Prefix | Devices |
|------------|-----------|--------------|---------|
| sm | 640px | `sm:` | Tablets (portrait) |
| md | 768px | `md:` | Tablets (landscape) |
| lg | 1024px | `lg:` | Desktops |
| xl | 1280px | `xl:` | Large desktops |
| 2xl | 1536px | `2xl:` | Extra large screens |

### Mobile First Aanpak

```tsx
// Start met mobile, voeg breakpoints toe
<div className="
  grid grid-cols-1      // Mobile: 1 column
  md:grid-cols-2        // Tablet: 2 columns  
  lg:grid-cols-3        // Desktop: 3 columns
  gap-4
">
```

### Responsive Patterns

```tsx
// Responsive padding
<div className="px-4 md:px-6 lg:px-8">

// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl">

// Responsive flex direction
<div className="flex flex-col md:flex-row">

// Hide/show based on screen
<div className="hidden md:block">   // Hidden op mobile
<div className="block md:hidden">   // Alleen mobile
```

## 🔝 Z-Index

Gestandaardiseerde z-index waarden:

```tsx
z-0     // 0   - Default
z-10    // 10  - Dropdowns
z-20    // 20  - Sticky headers
z-30    // 30  - Modals
z-40    // 40  - Toasts
z-50    // 50  - Tooltips
```

## 🎬 Animations

### Transition Classes

```tsx
transition-colors  // Kleur overgangen
transition-all     // Alle properties
transition-opacity // Opacity
transition-transform // Transform
```

### Duration

```tsx
duration-75    // 75ms - Zeer snel
duration-150   // 150ms - Snel (default hover)
duration-300   // 300ms - Standaard
duration-500   // 500ms - Langzaam
```

### Easing

```tsx
ease-in        // Versnellen
ease-out       // Vertragen
ease-in-out    // Versnellen en vertragen (default)
```

### Voorgedefinieerde Animaties

```tsx
animate-pulse       // Laad animatie (skeletons)
animate-spin        // Spinner animatie
animate-bounce      // Bounce effect
```

### Custom Animations

```tsx
// Hover effect
<button className="
  transition-colors duration-150
  hover:bg-primary/90
">

// Card hover
<div className="
  transition-shadow duration-200
  hover:shadow-lg
">

// Scale effect
<div className="
  transition-transform duration-150
  hover:scale-105
">
```

## 🎯 Component Patterns

### Card Pattern

```tsx
<div className="
  rounded-lg 
  border 
  bg-card 
  text-card-foreground 
  shadow-sm 
  hover:shadow-lg 
  transition-shadow
">
  <div className="p-6">
    {/* Content */}
  </div>
</div>
```

### Button Pattern

```tsx
<button className="
  inline-flex 
  items-center 
  justify-center 
  rounded-md 
  font-medium 
  transition-colors
  focus-visible:outline-none 
  focus-visible:ring-2
  disabled:pointer-events-none 
  disabled:opacity-50
  bg-primary 
  text-primary-foreground 
  hover:bg-primary/90
  h-10 
  px-4 
  py-2
">
```

### Input Pattern

```tsx
<input className="
  flex 
  h-10 
  w-full 
  rounded-md 
  border 
  border-input 
  bg-background 
  px-3 
  py-2 
  text-sm 
  ring-offset-background
  file:border-0 
  file:bg-transparent
  placeholder:text-muted-foreground
  focus-visible:outline-none 
  focus-visible:ring-2 
  focus-visible:ring-ring
  disabled:cursor-not-allowed 
  disabled:opacity-50
"/>
```

## 📚 Best Practices

### ✅ Do's

- Gebruik CSS variabelen via Tailwind classes
- Volg mobile-first responsive design
- Gebruik semantic class names
- Consistent spacing (4px grid)
- Gebruik transitions voor hover states
- Test in dark mode

### ❌ Don'ts

- Geen inline styles (behalve dynamische waarden)
- Geen hardcoded kleuren (gebruik theme variabelen)
- Geen willekeurige spacing waarden
- Geen inconsistente border radius
- Geen animaties zonder duration/easing

## 🔄 Updates

Bij wijzigingen aan het design system:

1. Update dit document
2. Update `tailwind.config.ts`
3. Update `globals.css` indien nodig
4. Test alle componenten
5. Update component documentatie

---

**Laatste Update:** 2024-10-28  
**Versie:** 1.0.0  
**Maintainer:** Frontend Design Team