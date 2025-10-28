# Folderstructuur

Complete overzicht van de project folderstructuur en organisatie principes.

## 📋 Inhoudsopgave

- [Overzicht](#overzicht)
- [Root Directory](#root-directory)
- [App Directory](#app-directory)
- [Components Directory](#components-directory)
- [Lib Directory](#lib-directory)
- [Docs Directory](#docs-directory)
- [Public Directory](#public-directory)
- [Organisatie Principes](#organisatie-principes)

## 🗂️ Overzicht

```
nieuwscraper-frontend/
├── app/                    # Next.js App Router pages
├── components/             # React componenten
├── lib/                    # Core utilities & configuraties
├── docs/                   # Documentatie
├── public/                 # Statische assets
├── .vscode/               # VSCode configuratie
├── node_modules/          # Dependencies (git ignored)
├── .next/                 # Build output (git ignored)
└── [config files]         # Root configuratie bestanden
```

## 📁 Root Directory

Configuratie bestanden in de root:

```
├── package.json              # NPM dependencies & scripts
├── package-lock.json         # Dependency lock file
├── tsconfig.json            # TypeScript configuratie
├── tailwind.config.ts       # Tailwind CSS configuratie
├── postcss.config.mjs       # PostCSS configuratie
├── next.config.mjs          # Next.js configuratie
├── .eslintrc.json          # ESLint configuratie
├── .gitignore              # Git ignore regels
├── .env.local              # Environment variabelen (git ignored)
├── .env.local.example      # Environment template
├── README.md               # Project documentatie
├── CONTRIBUTING.md         # Contributing gids
└── LICENSE                 # Project licentie
```

### Belangrijke Config Files

#### `package.json`
NPM package configuratie met:
- Dependencies (Next.js, React, TanStack Query, etc.)
- Dev dependencies (TypeScript, Tailwind, ESLint)
- Scripts (dev, build, start, lint)
- Project metadata

#### `tsconfig.json`
TypeScript compiler opties:
- Strict mode enabled
- Path aliases (`@/*`)
- Next.js plugin configuratie

#### `tailwind.config.ts`
Tailwind CSS configuratie:
- Theme extension (kleuren, spacing, etc.)
- Content paths
- Plugins

## 📱 App Directory

Next.js 14 App Router structuur:

```
app/
├── layout.tsx              # Root layout (wraps all pages)
├── page.tsx               # Home page (/)
├── globals.css            # Global styles & CSS variables
│
├── stats/                 # Statistics page
│   └── page.tsx          # /stats route
│
└── about/                # About page
    └── page.tsx          # /about route
```

### App Router Concepten

**Layout (`layout.tsx`)**
- Shared UI voor alle pages
- Wraps children
- Bevat Navigation, Footer, Providers
- Kan genest worden per route

**Page (`page.tsx`)**
- Unieke content voor een route
- Default export van een React component
- Kan Server Component zijn (default)

**File Conventions:**
- `page.tsx` - Pagina component
- `layout.tsx` - Layout wrapper
- `loading.tsx` - Loading UI (optioneel)
- `error.tsx` - Error UI (optioneel)
- `not-found.tsx` - 404 page (optioneel)

### Route Voorbeelden

| File Path | URL | Beschrijving |
|-----------|-----|--------------|
| `app/page.tsx` | `/` | Home - Artikel lijst |
| `app/stats/page.tsx` | `/stats` | Statistieken dashboard |
| `app/about/page.tsx` | `/about` | Over pagina |

## 🧩 Components Directory

Herbruikbare React componenten:

```
components/
├── ui/                        # Basis UI componenten
│   ├── button.tsx            # Button component
│   ├── card.tsx              # Card component
│   ├── input.tsx             # Input component
│   └── skeleton.tsx          # Skeleton loader
│
├── layout/                    # Layout componenten
│   └── navigation.tsx        # Main navigation
│
├── features/                  # Feature-specifieke componenten
│   ├── article-card.tsx      # Article display card
│   ├── article-filters.tsx   # Filters panel
│   ├── article-skeleton.tsx  # Article loading state
│   └── pagination.tsx        # Pagination component
│
├── providers.tsx             # App providers (Query, etc.)
└── error-boundary.tsx        # Error boundary component
```

### Component Categorieën

#### 1. UI Components (`ui/`)
Basis building blocks, volledig herbruikbaar:
- Button, Input, Card, Badge, etc.
- Geen business logic
- Accepteren props voor customization
- Styled met Tailwind

#### 2. Layout Components (`layout/`)
Structurele componenten:
- Navigation, Header, Footer, Sidebar
- Definiëren page layout
- Meestal gebruikt in `app/layout.tsx`

#### 3. Feature Components (`features/`)
Business logic & specifieke features:
- ArticleCard, ArticleFilters, Statistics
- Kunnen UI components gebruiken
- Bevatten feature-specifieke logic

### Component Naamgeving

```tsx
// ✅ Good - PascalCase voor components
Button.tsx
ArticleCard.tsx
NavigationMenu.tsx

// ✅ Good - kebab-case voor multi-word
article-card.tsx
navigation-menu.tsx

// ❌ Bad
button.tsx (te generiek zonder ui/)
articlecard.tsx (geen scheiding)
Article_Card.tsx (underscore)
```

## 📚 Lib Directory

Core utilities, types en configuraties:

```
lib/
├── api/                      # API integratie
│   ├── client.ts            # API client
│   └── errors.ts            # Error handling
│
├── types/                   # TypeScript types
│   └── api.ts               # API type definities
│
├── styles/                  # Styling configuratie
│   └── theme.ts             # Theme tokens & utilities
│
└── utils.ts                 # Helper functies
```

### Lib Structuur Details

#### `api/`
API client en communicatie:
- `client.ts` - APIClient class met alle endpoints
- `errors.ts` - Error handling utilities
- Gebruikt TypeScript types uit `types/`

#### `types/`
TypeScript type definities:
- `api.ts` - API response types, Article, Filters, etc.
- Geëxporteerde interfaces
- Enums voor error codes

#### `styles/`
Gecentraliseerde styling:
- `theme.ts` - Color tokens, spacing, typography
- Helper functies (getSourceColor, etc.)
- Type exports voor styling

#### `utils.ts`
Algemene helper functies:
- `cn()` - Class name merger
- `formatDate()` - Datum formatting
- `debounce()` - Input debouncing
- `truncateText()` - Text truncation

## 📖 Docs Directory

GitHub-style documentatie structuur:

```
docs/
├── README.md                        # Docs hoofdpagina
│
├── getting-started/                # Installatie & setup
│   ├── QUICKSTART.md
│   ├── INSTALLATION.md
│   └── CONFIGURATION.md
│
├── development/                    # Development guides
│   ├── DEVELOPMENT.md
│   ├── FOLDER-STRUCTURE.md        # Dit bestand
│   └── CODING-STANDARDS.md
│
├── styling/                        # Design & styling
│   ├── DESIGN-SYSTEM.md
│   ├── TAILWIND-CONFIG.md
│   ├── COMPONENT-STYLING.md
│   └── RESPONSIVE-DESIGN.md
│
├── components/                     # Component docs
│   ├── UI-COMPONENTS.md
│   ├── LAYOUT-COMPONENTS.md
│   └── FEATURE-COMPONENTS.md
│
├── api/                            # API documentatie
│   ├── API-CLIENT.md
│   ├── API-TYPES.md
│   └── ERROR-HANDLING.md
│
├── troubleshooting/               # Probleemoplossing
│   ├── TROUBLESHOOTING.md
│   ├── VSCODE-SETUP.md
│   └── COMMON-ISSUES.md
│
└── deployment/                    # Deployment
    ├── PRODUCTION.md
    ├── DEPLOYMENT.md
    └── ENVIRONMENT.md
```

### Documentatie Principes

1. **Markdown formaat** - Alle docs in `.md`
2. **Nederlands** - Documentatie taal (code blijft Engels)
3. **Inhoudsopgave** - Elke doc heeft TOC
4. **Code voorbeelden** - Veel praktische voorbeelden
5. **Emoji markers** - Voor visuele structuur (✅ ❌ ⚠️ 📝)

## 🖼️ Public Directory

Statische assets:

```
public/
├── favicon.ico              # Favicon
├── images/                  # Afbeeldingen
│   ├── logo.svg
│   └── og-image.png        # Open Graph image
└── robots.txt              # SEO robots file
```

### Public Assets

- Toegankelijk via `/` path (bijv. `/favicon.ico`)
- Geen hash in bestandsnaam
- Wordt niet door webpack verwerkt
- Voor static files die niet veranderen

## 🎯 Organisatie Principes

### 1. Colocatie

Gerelateerde bestanden bij elkaar:

```
components/
└── article-card/
    ├── article-card.tsx         # Component
    ├── article-card.test.tsx    # Tests
    └── article-card.stories.tsx # Storybook (optioneel)
```

### 2. Feature-based

Groepeer per feature, niet per type:

```
// ✅ Good - Feature based
features/
├── articles/
│   ├── ArticleList.tsx
│   ├── ArticleCard.tsx
│   └── ArticleFilters.tsx
└── stats/
    ├── StatsCard.tsx
    └── StatsChart.tsx

// ❌ Bad - Type based
components/
├── lists/
│   └── ArticleList.tsx
└── cards/
    ├── ArticleCard.tsx
    └── StatsCard.tsx
```

### 3. Barrel Exports

Gebruik index files voor cleane imports:

```tsx
// components/ui/index.ts
export { Button } from './button';
export { Card } from './card';
export { Input } from './input';

// Usage
import { Button, Card, Input } from '@/components/ui';
```

### 4. Naamgevingsconventies

| Type | Convention | Voorbeeld |
|------|------------|-----------|
| Components | PascalCase | `ArticleCard.tsx` |
| Utilities | camelCase | `formatDate.ts` |
| Types | PascalCase | `APIResponse` |
| Constants | UPPER_SNAKE | `API_BASE_URL` |
| CSS files | kebab-case | `globals.css` |
| Directories | kebab-case | `article-filters/` |

### 5. Import Volgorde

```tsx
// 1. External imports
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal imports (absolute)
import { apiClient } from '@/lib/api/client';
import { Article } from '@/lib/types/api';

// 3. Component imports
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. Relative imports
import { formatDate } from '../utils';

// 5. Styles (if any)
import './styles.css';
```

### 6. File Size Richtlijnen

- **Components**: < 300 regels
- **Utilities**: < 200 regels
- **Types**: < 500 regels

Als een bestand te groot wordt:
1. Split in meerdere files
2. Extract herbruikbare logic
3. Maak sub-componenten

## 🔍 Quick Reference

### Waar plaats ik...?

| Wat | Waar | Voorbeeld |
|-----|------|-----------|
| Nieuwe pagina | `app/[route]/page.tsx` | `app/news/page.tsx` |
| Herbruikbare UI | `components/ui/` | `components/ui/badge.tsx` |
| Feature component | `components/features/` | `components/features/article-list.tsx` |
| API types | `lib/types/` | `lib/types/api.ts` |
| Helper functie | `lib/utils.ts` | `formatDate()` |
| Styling config | `lib/styles/` | `lib/styles/theme.ts` |
| Documentatie | `docs/[category]/` | `docs/styling/DESIGN-SYSTEM.md` |
| Statische image | `public/images/` | `public/images/logo.svg` |

## 📚 Gerelateerde Documentatie

- [Development Guide](./DEVELOPMENT.md)
- [Coding Standards](./CODING-STANDARDS.md)
- [Component Styling](../styling/COMPONENT-STYLING.md)

---

**Laatste Update:** 2024-10-28  
**Versie:** 1.0.0