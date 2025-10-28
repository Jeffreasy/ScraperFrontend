# Nieuws Scraper Frontend 📰

Een moderne, professioneel gestylde frontend applicatie voor het aggregeren en weergeven van Nederlands nieuws. Gebouwd met Next.js 14, TypeScript, en een volledig gedocumenteerd design system.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square)
![React Query](https://img.shields.io/badge/TanStack_Query-5.0-red?style=flat-square)

## ✨ Highlights

- 🎨 **Volledig Design System** - Gecentraliseerde styling met tokens en patterns
- 📱 **100% Responsive** - Mobile-first design voor alle devices
- ⚡ **Optimale Performance** - Server Components en smart caching
- 🧩 **Component Library** - Herbruikbare, professioneel gestylde componenten
- 📚 **Uitgebreide Documentatie** - GitHub-style docs met styling gids
- 🎯 **Type-Safe** - Complete TypeScript coverage
- ♿ **Accessible** - WCAG compliant componenten

## 🚀 Snelstart

```bash
# Installeer dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - klaar! 🎉

> **Meer details?** Zie [Snelstart Gids](docs/getting-started/QUICKSTART.md)

## 📸 Features

### 🏠 Home - Artikel Browser
- Real-time zoeken met debouncing
- Geavanceerde filters (bron, categorie, datum, keywords)
- Multiple sort opties (datum, titel)
- Smart pagination
- Responsive grid layout

### 📊 Statistieken Dashboard  
- Live article metrics
- Bron distributie met progress bars
- Categorie overzicht met iconen
- System health monitoring
- Auto-refresh functionaliteit

### 🎨 Design & Styling
- **Consistent Design System** - Alle kleuren, spacing, en typography gedocumenteerd
- **Professional Components** - Card, Button, Input, Badge met variants
- **Responsive Patterns** - Mobile-first met breakpoint utilities
- **Dark Mode Ready** - Complete theming systeem
- **Smooth Animations** - Transitions en hover effects

## 📁 Project Structuur

```
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home (artikel lijst)
│   ├── stats/             # Statistieken dashboard
│   └── about/             # Over pagina
│
├── components/            # React componenten
│   ├── ui/               # Basis UI components (Button, Card, Input)
│   ├── layout/           # Layout components (Navigation)
│   └── features/         # Feature components (ArticleCard, Filters)
│
├── lib/                  # Core utilities & config
│   ├── api/             # API client & error handling
│   ├── types/           # TypeScript definities
│   ├── styles/          # Theme configuratie & tokens
│   └── utils.ts         # Helper functies
│
└── docs/                # Complete documentatie
    ├── getting-started/ # Installatie & setup
    ├── development/     # Development guides
    ├── styling/         # Design system & styling
    ├── components/      # Component documentatie
    ├── api/             # API integratie
    ├── troubleshooting/ # Probleemoplossing
    └── deployment/      # Deployment guides
```

> **Volledige structuur?** Zie [Folderstructuur](docs/development/FOLDER-STRUCTURE.md)

## 🎨 Design System

We hebben een volledig gedocumenteerd design system met:

### Kleuren
- Primary, Secondary, Muted, Accent, Destructive
- Nieuwsbron-specifieke kleuren (nu.nl, ad.nl, nos.nl, etc.)
- Dark mode support

### Typography
- Inter font family
- 6 heading levels met presets
- Body text variants (large, base, small, xs)

### Spacing
- 4px grid systeem
- Consistent padding/margin scale
- Gap utilities voor flex/grid

### Components
- Pre-styled Button variants (primary, secondary, outline, ghost)
- Card patterns (base, hover, interactive, elevated)
- Input styles met focus states
- Badge variants

> **Volledige documentatie:** [Design System](docs/styling/DESIGN-SYSTEM.md)

## 🧩 Component Library

### UI Components (`components/ui/`)
Basis building blocks:
- [`Button`](components/ui/button.tsx) - 5 variants, 3 sizes
- [`Card`](components/ui/card.tsx) - CardHeader, CardContent, CardFooter
- [`Input`](components/ui/input.tsx) - Met focus states
- [`Skeleton`](components/ui/skeleton.tsx) - Loading states

### Feature Components
Business logic components:
- [`ArticleCard`](components/article-card.tsx) - Professional artikel weergave
- [`ArticleFilters`](components/article-filters.tsx) - Geavanceerde filtering
- [`Pagination`](components/pagination.tsx) - Smart page navigatie
- [`Navigation`](components/navigation.tsx) - Main app navigation

> **Component gids:** [Component Styling](docs/styling/COMPONENT-STYLING.md)

## 📚 Documentatie

Volledige GitHub-style documentatie in [`docs/`](docs/):

### Voor Developers
- 📖 [Development Guide](docs/development/DEVELOPMENT.md) - Complete dev gids
- 🗂️ [Folder Structure](docs/development/FOLDER-STRUCTURE.md) - Project organisatie
- 📝 [Coding Standards](docs/development/CODING-STANDARDS.md) - Code conventies

### Voor Designers
- 🎨 [Design System](docs/styling/DESIGN-SYSTEM.md) - Complete tokens & patterns
- 🖌️ [Component Styling](docs/styling/COMPONENT-STYLING.md) - Styling richtlijnen
- 📱 [Responsive Design](docs/styling/RESPONSIVE-DESIGN.md) - Mobile-first patterns

### Voor Iedereen
- ⚡ [Quickstart](docs/getting-started/QUICKSTART.md) - Begin in 5 minuten
- 🔧 [Troubleshooting](docs/troubleshooting/TROUBLESHOOTING.md) - Probleemoplossing
- 🚀 [Deployment](docs/deployment/DEPLOYMENT.md) - Production deployment

> **Start hier:** [Documentatie Overzicht](docs/README.md)

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 14** - React framework met App Router
- **React 18** - UI library met Server Components
- **TypeScript 5.6** - Type-safe development

### Styling & Design
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Custom Design System** - Gedocumenteerd in `lib/styles/theme.ts`
- **CSS Variables** - Voor dark mode support
- **Responsive Design** - Mobile-first breakpoints

### State & Data
- **TanStack Query 5** - Server state management
- **Native Fetch API** - HTTP client
- **Smart Caching** - 60s stale time, auto invalidation

### Developer Experience
- **ESLint** - Code linting
- **TypeScript Strict Mode** - Maximum type safety
- **Path Aliases** - Clean imports met `@/`
- **VSCode Config** - Pre-configured settings

## ⚙️ Configuratie

### Environment Variables

```env
# API Configuratie
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_API_KEY=                    # Optioneel

# App Configuratie  
NEXT_PUBLIC_APP_NAME=Nieuws Scraper
NEXT_PUBLIC_ITEMS_PER_PAGE=20
```

### Theme Aanpassing

Pas kleuren aan in [`app/globals.css`](app/globals.css):

```css
:root {
  --primary: 221.2 83.2% 53.3%;      /* Hoofdkleur */
  --background: 0 0% 100%;            /* Achtergrond */
  /* ... meer variabelen */
}
```

Of gebruik tokens in [`lib/styles/theme.ts`](lib/styles/theme.ts).

## 🎯 Development

### Belangrijke Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Development Workflow

1. **Feature Branches** - Nooit direct naar main
2. **TypeScript** - Alle code fully typed
3. **Component First** - Herbruikbare components
4. **Design System** - Gebruik theme tokens
5. **Documentation** - Update docs bij wijzigingen

> **Development gids:** [Development.md](docs/development/DEVELOPMENT.md)

## 📐 Styling Richtlijnen

### Gebruik Design Tokens

```tsx
import { cardStyles, headings, spacing } from '@/lib/styles/theme';

// ✅ Good - Use design tokens
<div className={cardStyles.base}>
  <h2 className={headings.h2}>Title</h2>
</div>

// ❌ Bad - Hardcoded values
<div className="rounded-lg p-6 bg-white">
  <h2 className="text-2xl">Title</h2>
</div>
```

### Responsive Design

```tsx
// Mobile-first approach
<div className="
  grid grid-cols-1           // Mobile: 1 column
  md:grid-cols-2             // Tablet: 2 columns
  lg:grid-cols-3             // Desktop: 3 columns
  gap-4                      // Consistent spacing
">
```

### Component Variants

```tsx
import { cn } from '@/lib/utils';

<button className={cn(
  'base-classes',
  variant === 'primary' && 'primary-classes',
  variant === 'secondary' && 'secondary-classes',
  className // Allow override
)}>
```

> **Styling gids:** [Component Styling](docs/styling/COMPONENT-STYLING.md)

## 🚀 Deployment

### Vercel (Aanbevolen)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build image
docker build -t nieuws-scraper-frontend .

# Run container
docker run -p 3000:3000 nieuws-scraper-frontend
```

### Environment Variables

Zorg voor juiste environment variables in production:
```env
NEXT_PUBLIC_API_URL=https://api.jouwdomain.com
```

> **Deployment gids:** [Deployment.md](docs/deployment/DEPLOYMENT.md)

## 🐛 Troubleshooting

### TypeScript Errors in VSCode?
**Fix:** Press `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### Build Fails?
```bash
rm -rf .next node_modules
npm install
npm run build
```

### API Connection Issues?
1. Check backend is running: `curl http://localhost:8080/health`
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check CORS settings in backend

> **Volledige gids:** [Troubleshooting](docs/troubleshooting/TROUBLESHOOTING.md)

## 📊 Performance

### Build Stats

```
Route (app)              Size     First Load JS
┌ ○ /                   11 kB    116 kB
├ ○ /about             138 B     87.4 kB
└ ○ /stats             3.5 kB    99.7 kB
```

### Optimalisaties

✅ Server Components (default)  
✅ Smart caching (60s stale time)  
✅ Image optimization  
✅ Code splitting  
✅ CSS purging  
✅ Bundle analysis ready  

## 🤝 Contributing

Bijdragen zijn welkom! Volg deze stappen:

1. Fork het project
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

### Coding Standards

- TypeScript strict mode
- Tailwind utility classes
- Mobile-first responsive
- Component documentation
- Design system compliance

> **Contributing gids:** [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 Licentie

Dit project is gelicenseerd onder de MIT License - zie [LICENSE](LICENSE) voor details.

## 🙏 Acknowledgments

- **Next.js Team** - Voor het geweldige framework
- **Vercel** - Voor hosting en optimalisatie
- **Tailwind Labs** - Voor Tailwind CSS
- **TanStack** - Voor React Query
- **Alle Contributors** - Voor jullie bijdragen

## 📞 Support & Contact

- 📚 **Documentatie:** [docs/](docs/)
- 🐛 **Issues:** GitHub Issues
- 💬 **Discussions:** GitHub Discussions
- 📧 **Email:** [contact info]

---

<div align="center">

**Gemaakt met ❤️ voor Nederlands nieuws**

[Documentatie](docs/) · [Design System](docs/styling/DESIGN-SYSTEM.md) · [Contributing](CONTRIBUTING.md)

</div>