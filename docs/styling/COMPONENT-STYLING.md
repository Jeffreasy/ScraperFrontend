# Component Styling Gids

Complete gids voor het stylen van componenten in Nieuws Scraper Frontend.

## 📋 Inhoudsopgave

- [Styling Principes](#styling-principes)
- [Component Patterns](#component-patterns)
- [Layout Patterns](#layout-patterns)
- [Responsive Patterns](#responsive-patterns)
- [State Styling](#state-styling)
- [Best Practices](#best-practices)

## 🎯 Styling Principes

### 1. Utility-First Aanpak

Gebruik Tailwind utility classes als primaire styling methode:

```tsx
// ✅ Good - Utility classes
<div className="flex items-center gap-4 p-6 rounded-lg bg-card">

// ❌ Bad - Inline styles
<div style={{ display: 'flex', padding: '24px' }}>
```

### 2. Component Classes Samenstellen

Gebruik de `cn()` utility voor voorwaardelijke classes:

```tsx
import { cn } from '@/lib/utils';

<button
  className={cn(
    'base-classes',
    isActive && 'active-classes',
    disabled && 'disabled-classes',
    className // Allow override
  )}
/>
```

### 3. Consistent Spacing

Volg het 4px grid systeem:

```tsx
// Padding/Margin
p-4    // 16px - Standard
p-6    // 24px - Cards
p-8    // 32px - Sections

// Gap
gap-2  // 8px - Kleine elementen
gap-4  // 16px - Standard
gap-6  // 24px - Grote elementen
```

## 🧩 Component Patterns

### Card Component

```tsx
<div className={cn(
  // Base styles
  'rounded-lg border bg-card text-card-foreground',
  // Shadow
  'shadow-sm',
  // Overflow
  'overflow-hidden',
  // Transitions
  'transition-shadow duration-200',
  // Hover
  'hover:shadow-lg',
  // Optional className prop
  className
)}>
  <div className="p-6">
    {children}
  </div>
</div>
```

### Button Component

```tsx
// Primary Button
<button className={cn(
  // Layout
  'inline-flex items-center justify-center',
  // Spacing
  'h-10 px-4 py-2',
  // Typography
  'text-sm font-medium',
  // Borders
  'rounded-md',
  // Colors
  'bg-primary text-primary-foreground',
  // Transitions
  'transition-colors duration-150',
  // Hover
  'hover:bg-primary/90',
  // Focus
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  // Disabled
  'disabled:pointer-events-none disabled:opacity-50'
)}>

// Secondary Button
<button className={cn(
  'inline-flex items-center justify-center',
  'h-10 px-4 py-2',
  'text-sm font-medium',
  'rounded-md',
  'bg-secondary text-secondary-foreground',
  'hover:bg-secondary/80',
  'transition-colors'
)}>

// Outline Button
<button className={cn(
  'inline-flex items-center justify-center',
  'h-10 px-4 py-2',
  'text-sm font-medium',
  'rounded-md',
  'border border-input bg-background',
  'hover:bg-accent hover:text-accent-foreground',
  'transition-colors'
)}>
```

### Input Component

```tsx
<input className={cn(
  // Layout
  'flex w-full',
  // Sizing
  'h-10 px-3 py-2',
  // Typography
  'text-sm',
  // Borders
  'rounded-md border border-input',
  // Colors
  'bg-background',
  // Ring
  'ring-offset-background',
  // Placeholder
  'placeholder:text-muted-foreground',
  // Focus
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  // Disabled
  'disabled:cursor-not-allowed disabled:opacity-50'
)} />
```

### Badge Component

```tsx
<span className={cn(
  // Layout
  'inline-flex items-center',
  // Spacing
  'rounded-full px-2.5 py-0.5',
  // Typography
  'text-xs font-semibold',
  // Colors (variant based)
  variant === 'default' && 'bg-primary text-primary-foreground',
  variant === 'secondary' && 'bg-secondary text-secondary-foreground',
  variant === 'outline' && 'border border-input',
)}>
```

## 📐 Layout Patterns

### Container Pattern

```tsx
// Page container
<div className="container mx-auto px-4 py-8">
  {/* Content */}
</div>

// Max-width container
<div className="max-w-7xl mx-auto px-4">
  {/* Content */}
</div>

// Narrow container (voor text content)
<div className="max-w-2xl mx-auto px-4">
  {/* Content */}
</div>
```

### Grid Layouts

```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} />)}
</div>

// Auto-fit grid
<div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>

// Fixed columns met gap
<div className="grid grid-cols-12 gap-4">
  <div className="col-span-12 md:col-span-8">Main</div>
  <div className="col-span-12 md:col-span-4">Sidebar</div>
</div>
```

### Flex Layouts

```tsx
// Horizontal met space between
<div className="flex items-center justify-between">
  <div>Left</div>
  <div>Right</div>
</div>

// Vertical stack met spacing
<div className="flex flex-col space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// Centered content
<div className="flex items-center justify-center min-h-screen">
  <div>Centered</div>
</div>

// Flex wrap
<div className="flex flex-wrap gap-2">
  {tags.map(tag => <Badge key={tag} />)}
</div>
```

### Stack Pattern

```tsx
// Vertical stack (voor lijsten, formulieren)
<div className="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

// Horizontal stack
<div className="flex gap-4">
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</div>
```

## 📱 Responsive Patterns

### Show/Hide Pattern

```tsx
// Desktop only
<div className="hidden md:block">
  Desktop content
</div>

// Mobile only  
<div className="block md:hidden">
  Mobile content
</div>

// Tablet and up
<div className="hidden sm:block">
  Tablet+ content
</div>
```

### Responsive Flex Direction

```tsx
// Stack op mobile, row op desktop
<div className="flex flex-col md:flex-row gap-4">
  <div className="flex-1">Content 1</div>
  <div className="flex-1">Content 2</div>
</div>
```

### Responsive Grid Columns

```tsx
// 1 kolom mobile, 2 tablet, 3 desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>

// 1 kolom mobile, 2 desktop, 4 large screens
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>
```

### Responsive Spacing

```tsx
// Variabele padding
<div className="px-4 md:px-6 lg:px-8">
  {/* Content */}
</div>

// Variabele gap
<div className="grid gap-4 md:gap-6 lg:gap-8">
  {/* Content */}
</div>
```

### Responsive Typography

```tsx
// Responsive heading
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Title
</h1>

// Responsive body
<p className="text-sm md:text-base">
  Content
</p>
```

## 🎭 State Styling

### Hover States

```tsx
// Background hover
<div className="bg-card hover:bg-accent transition-colors">

// Shadow hover
<div className="shadow-sm hover:shadow-lg transition-shadow">

// Scale hover
<div className="hover:scale-105 transition-transform">

// Border hover
<div className="border border-transparent hover:border-primary transition-colors">
```

### Focus States

```tsx
// Standard focus ring
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">

// Custom focus
<input className="focus:border-primary focus:ring-2 focus:ring-primary/20">
```

### Active States

```tsx
// Active button
<button className={cn(
  'bg-secondary',
  isActive && 'bg-primary text-primary-foreground'
)}>

// Active tab
<button className={cn(
  'border-b-2 border-transparent',
  isActive && 'border-primary text-primary'
)}>
```

### Disabled States

```tsx
// Disabled button
<button className="disabled:opacity-50 disabled:cursor-not-allowed" disabled>

// Disabled input
<input className="disabled:bg-muted disabled:cursor-not-allowed" disabled />
```

### Loading States

```tsx
// Loading overlay
<div className="relative">
  {isLoading && (
    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
      <div className="animate-spin">⏳</div>
    </div>
  )}
  {/* Content */}
</div>

// Loading skeleton
{isLoading ? (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-muted rounded w-3/4" />
    <div className="h-4 bg-muted rounded w-1/2" />
  </div>
) : (
  <div>{content}</div>
)}
```

## 🎨 Color Usage Patterns

### Text Colors

```tsx
// Primary text
<p className="text-foreground">

// Secondary text
<p className="text-muted-foreground">

// Emphasized text
<strong className="font-semibold text-foreground">

// Link text
<a className="text-primary hover:underline">
```

### Background Colors

```tsx
// Page background
<div className="bg-background">

// Card background
<div className="bg-card">

// Highlighted background
<div className="bg-accent">

// Muted background
<div className="bg-muted">
```

### Border Colors

```tsx
// Default border
<div className="border border-border">

// Input border
<input className="border border-input">

// Accent border
<div className="border-l-4 border-primary">
```

## 🔧 Utility Patterns

### Truncate Text

```tsx
// Single line truncate
<p className="truncate">
  Long text that will be truncated...
</p>

// Multi-line clamp
<p className="line-clamp-2">
  Long text that will be clamped to 2 lines...
</p>

// Line clamp 3
<p className="line-clamp-3">
  Text content...
</p>
```

### Aspect Ratio

```tsx
// 16:9 aspect ratio
<div className="aspect-video">
  {/* Content */}
</div>

// Square aspect ratio
<div className="aspect-square">
  {/* Content */}
</div>

// Custom aspect ratio
<div className="aspect-[4/3]">
  {/* Content */}
</div>
```

### Positioning

```tsx
// Sticky header
<header className="sticky top-0 z-20 bg-background border-b">

// Fixed footer
<footer className="fixed bottom-0 left-0 right-0">

// Absolute centering
<div className="absolute inset-0 flex items-center justify-center">
```

## ✅ Best Practices

### 1. Consistency

```tsx
// ✅ Good - Consistent spacing
<div className="space-y-6">
  <Card className="p-6" />
  <Card className="p-6" />
</div>

// ❌ Bad - Inconsistent spacing
<div>
  <Card className="p-6" />
  <Card className="p-4" />
</div>
```

### 2. Semantic Classes

```tsx
// ✅ Good - Semantic classes
<article className="bg-card">

// ❌ Bad - Generic divs overal
<div className="bg-white">
```

### 3. Reusable Patterns

```tsx
// ✅ Good - Extracted pattern
const cardClasses = 'rounded-lg border bg-card shadow-sm p-6';

<div className={cardClasses}>
<div className={cardClasses}>

// ❌ Bad - Duplicate classes
<div className="rounded-lg border bg-card shadow-sm p-6">
<div className="rounded-lg border bg-card shadow-sm p-6">
```

### 4. Responsive Design

```tsx
// ✅ Good - Mobile first
<div className="grid grid-cols-1 md:grid-cols-2">

// ❌ Bad - Desktop first
<div className="grid-cols-2 max-md:grid-cols-1">
```

### 5. Accessibility

```tsx
// ✅ Good - Focus states
<button className="focus-visible:ring-2">

// ❌ Bad - No focus indication
<button className="outline-none">
```

## 🚫 Common Pitfalls

### Pitfall 1: Te veel nested classes

```tsx
// ❌ Bad
<div className="flex">
  <div className="flex">
    <div className="flex">

// ✅ Good - Simplify structure
<div className="flex gap-4">
  {items.map(item => <Item key={item} />)}
</div>
```

### Pitfall 2: Hardcoded kleuren

```tsx
// ❌ Bad
<div className="bg-[#3b82f6]">

// ✅ Good
<div className="bg-primary">
```

### Pitfall 3: Inconsistent spacing

```tsx
// ❌ Bad
<div className="mt-3 mb-5">

// ✅ Good - Use consistent values
<div className="my-4">
```

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Design System](./DESIGN-SYSTEM.md)
- [Responsive Design](./RESPONSIVE-DESIGN.md)

---

**Laatste Update:** 2024-10-28  
**Versie:** 1.0.0