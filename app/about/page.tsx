import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, Database, Zap, Shield, Code, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Over Nieuws Scraper</h1>
        <p className="text-lg text-muted-foreground">
          Een moderne nieuws aggregator voor Nederland
        </p>
      </div>

      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Wat is Nieuws Scraper?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Nieuws Scraper is een krachtige nieuws aggregator die automatisch het laatste
            nieuws verzamelt van de belangrijkste Nederlandse nieuwsbronnen. Met een
            moderne, gebruiksvriendelijke interface kun je snel door duizenden artikelen
            bladeren, zoeken en filteren.
          </p>
          <p>
            De applicatie gebruikt geavanceerde scraping technologie om real-time nieuws
            te verzamelen en te indexeren, zodat je altijd up-to-date blijft met de
            belangrijkste gebeurtenissen.
          </p>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5" />
              Krachtige Database
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            PostgreSQL database met full-text search voor bliksemsnelle zoekresultaten
            door duizenden artikelen.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5" />
              Real-time Updates
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Automatische scraping van nieuwsbronnen zorgt voor up-to-date content zonder
            vertraging.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              Betrouwbaar
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Rate limiting, caching en error handling zorgen voor een stabiele en
            betrouwbare ervaring.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Code className="h-5 w-5" />
              Modern Tech Stack
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Next.js 14, TypeScript, TanStack Query en Tailwind CSS voor optimale
            performance en ontwikkelervaring.
          </CardContent>
        </Card>
      </div>

      {/* Tech Stack */}
      <Card>
        <CardHeader>
          <CardTitle>Technologie Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-3">Frontend</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Next.js 14 met App Router
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  React 18 met Server Components
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  TypeScript voor type safety
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  TanStack Query voor data fetching
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Tailwind CSS voor styling
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Backend</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Go (Golang) API server
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  PostgreSQL database
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Redis voor caching
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  RSS feed scraping
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  RESTful API met rate limiting
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Info */}
      <Card>
        <CardHeader>
          <CardTitle>API Informatie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            De backend API draait op{' '}
            <code className="bg-muted px-1.5 py-0.5 rounded">
              {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}
            </code>
          </p>
          <p>
            Alle API endpoints volgen RESTful principes met consistente response
            formats, uitgebreide error handling en automatische rate limiting.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Rate Limit</p>
              <p className="font-semibold">100/min</p>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Cache TTL</p>
              <p className="font-semibold">5 min</p>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Max Results</p>
              <p className="font-semibold">100</p>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">API Version</p>
              <p className="font-semibold">v1</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Made with Love */}
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground flex items-center justify-center gap-2">
            Gemaakt met <Heart className="h-4 w-4 text-red-500" /> voor het Nederlandse
            nieuws
          </p>
        </CardContent>
      </Card>
    </div>
  );
}