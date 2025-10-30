import { cva, type VariantProps } from 'class-variance-authority';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Newspaper,
  Database,
  Zap,
  Shield,
  Code,
  Heart,
  CheckCircle,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import {
  cn,
  flexPatterns,
  spacing,
  bodyText,
  gap,
  responsiveHeadings,
  gridLayouts,
} from '@/lib/styles/theme';

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const featureCardVariants = cva(
  ['transition-all duration-200'],
  {
    variants: {
      variant: {
        default: 'hover:shadow-md',
        elevated: 'shadow-sm hover:shadow-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const statCardVariants = cva(
  ['rounded-lg p-3 bg-muted', 'transition-colors duration-200'],
  {
    variants: {
      interactive: {
        true: 'hover:bg-muted/80 cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      interactive: false,
    },
  }
);

const techListItemVariants = cva(
  ['flex items-center gap-2', bodyText.small, 'text-muted-foreground'],
  {
    variants: {
      highlight: {
        true: 'text-foreground font-medium',
        false: '',
      },
    },
    defaultVariants: {
      highlight: false,
    },
  }
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AboutPage() {
  return (
    <div className={spacing.lg}>
      {/* Page Header */}
      <PageHeader />

      {/* Introduction */}
      <IntroductionCard />

      {/* Key Features */}
      <FeaturesGrid />

      {/* Tech Stack */}
      <TechStackCard />

      {/* API Information */}
      <APIInfoCard />

      {/* Made with Love */}
      <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
        <CardContent className="pt-6">
          <p className={cn('text-center text-muted-foreground', flexPatterns.center, gap.sm)}>
            Gemaakt met <Heart className="h-4 w-4 text-red-500 animate-pulse" /> voor het
            Nederlandse nieuws
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// SUB COMPONENTS
// ============================================================================

function PageHeader() {
  return (
    <div className={spacing.xs}>
      <h1 className={responsiveHeadings.h1}>Over Nieuws Scraper</h1>
      <p className="text-lg text-muted-foreground">
        Een moderne nieuws aggregator voor Nederland
      </p>
    </div>
  );
}

function IntroductionCard() {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className={cn(flexPatterns.start, gap.sm)}>
          <Newspaper className="h-5 w-5 text-primary" />
          Wat is Nieuws Scraper?
        </CardTitle>
      </CardHeader>
      <CardContent className={cn(spacing.md, 'text-muted-foreground')}>
        <p>
          Nieuws Scraper is een krachtige nieuws aggregator die automatisch het laatste nieuws
          verzamelt van de belangrijkste Nederlandse nieuwsbronnen. Met een moderne,
          gebruiksvriendelijke interface kun je snel door duizenden artikelen bladeren, zoeken
          en filteren.
        </p>
        <p>
          De applicatie gebruikt geavanceerde scraping technologie om real-time nieuws te
          verzamelen en te indexeren, zodat je altijd up-to-date blijft met de belangrijkste
          gebeurtenissen.
        </p>
      </CardContent>
    </Card>
  );
}

function FeaturesGrid() {
  const features = [
    {
      icon: Database,
      title: 'Krachtige Database',
      description: 'PostgreSQL database met full-text search voor bliksemsnelle zoekresultaten door duizenden artikelen.',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Automatische scraping van nieuwsbronnen zorgt voor up-to-date content zonder vertraging.',
      color: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      icon: Shield,
      title: 'Betrouwbaar',
      description: 'Rate limiting, caching en error handling zorgen voor een stabiele en betrouwbare ervaring.',
      color: 'text-green-600 dark:text-green-400',
    },
    {
      icon: Code,
      title: 'Modern Tech Stack',
      description: 'Next.js 14, TypeScript, TanStack Query en Tailwind CSS voor optimale performance en ontwikkelervaring.',
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      icon: TrendingUp,
      title: 'Stock Integration',
      description: 'Real-time stock quotes, charts en financial metrics geïntegreerd in nieuws artikelen.',
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Insights',
      description: 'Sentiment analysis, entity extraction en keyword detection voor betere content discovery.',
      color: 'text-pink-600 dark:text-pink-400',
    },
  ];

  return (
    <div className={cn(gridLayouts.threeColumn, gap.md)}>
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <Card key={feature.title} className={featureCardVariants({ variant: 'elevated' })}>
            <CardHeader>
              <CardTitle className={cn(flexPatterns.start, gap.sm, 'text-lg')}>
                <Icon className={cn('h-5 w-5', feature.color)} />
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent className={cn(bodyText.small, 'text-muted-foreground')}>
              {feature.description}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function TechStackCard() {
  const frontend = [
    'Next.js 14 met App Router',
    'React 18 met Server Components',
    'TypeScript voor type safety',
    'TanStack Query voor data fetching',
    'Tailwind CSS voor styling',
    'Class Variance Authority (CVA)',
  ];

  const backend = [
    'Go (Golang) API server',
    'PostgreSQL database',
    'Redis voor caching',
    'RSS feed scraping',
    'RESTful API met rate limiting',
    'Browser automation (Puppeteer)',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technologie Stack</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn('grid gap-6', gridLayouts.twoColumn)}>
          <TechStackSection title="Frontend" items={frontend} />
          <TechStackSection title="Backend" items={backend} />
        </div>
      </CardContent>
    </Card>
  );
}

function TechStackSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-semibold mb-3">{title}</h3>
      <ul className={spacing.xs}>
        {items.map((item) => (
          <li key={item} className={techListItemVariants()}>
            <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function APIInfoCard() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const stats = [
    { label: 'Rate Limit', value: '100/min', color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Cache TTL', value: '5 min', color: 'text-green-600 dark:text-green-400' },
    { label: 'Max Results', value: '100', color: 'text-purple-600 dark:text-purple-400' },
    { label: 'API Version', value: 'v1', color: 'text-orange-600 dark:text-orange-400' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Informatie</CardTitle>
      </CardHeader>
      <CardContent className={cn(spacing.sm, bodyText.small, 'text-muted-foreground')}>
        <p>
          De backend API draait op{' '}
          <code className={cn('bg-muted px-1.5 py-0.5 rounded font-mono', bodyText.xs)}>
            {apiUrl}
          </code>
        </p>
        <p>
          Alle API endpoints volgen RESTful principes met consistente response formats,
          uitgebreide error handling en automatische rate limiting.
        </p>
        <div className={cn('grid grid-cols-2 sm:grid-cols-4', gap.sm, 'mt-4')}>
          {stats.map((stat) => (
            <div key={stat.label} className={statCardVariants()}>
              <p className={cn(bodyText.xs, 'text-muted-foreground mb-1')}>{stat.label}</p>
              <p className={cn('font-semibold', stat.color)}>{stat.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

// Note: CVA variants are not exported from page components to avoid Next.js type conflicts
// Use these variants only within this component file