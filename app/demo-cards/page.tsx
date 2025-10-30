'use client';

import { ArticleCard } from '@/components/article-card';
import { Article } from '@/lib/types/api';

// Mock article data voor demonstratie
const mockArticle: Article = {
    id: 1,
    title: 'Dit is een voorbeeld artikel titel die langer kan zijn en automatisch wordt afgeknipt volgens de variant',
    summary: 'Dit is een langere samenvatting van het artikel die verschillende lengtes kan hebben afhankelijk van de gekozen card variant. De compact variant toont minder tekst, terwijl de large variant meer ruimte biedt voor uitgebreidere beschrijvingen.',
    url: 'https://example.com/artikel',
    source: 'nu.nl',
    published: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    image_url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop',
    category: 'Nieuws',
    author: 'Demo Auteur',
    keywords: ['technologie', 'innovatie', 'nieuws', 'Nederland', 'business'],
    content_extracted: true,
    content: 'Volledige artikel content hier...',
    ai_processed: false,
};

export default function DemoCardsPage() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-12">
            <div>
                <h1 className="text-4xl font-bold mb-2">Article Card Variants Demo</h1>
                <p className="text-muted-foreground text-lg">
                    Demonstratie van de drie verschillende card sizes met optimale text truncation
                </p>
            </div>

            {/* Compact Variant */}
            <section className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                    <h2 className="text-2xl font-bold">Compact Variant</h2>
                    <p className="text-muted-foreground">
                        Ideaal voor sidebars, mobile layouts, en dense lijsten
                    </p>
                    <div className="mt-2 text-sm space-y-1">
                        <p><span className="font-semibold">Image:</span> 128px (h-32)</p>
                        <p><span className="font-semibold">Title:</span> text-base, 2 lines max</p>
                        <p><span className="font-semibold">Summary:</span> text-xs, 2 lines max</p>
                        <p><span className="font-semibold">Padding:</span> 12px (p-3)</p>
                        <p><span className="font-semibold">Features:</span> Geen keywords, tickers, of AI categories</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ArticleCard article={mockArticle} size="compact" showScraping={true} />
                    <ArticleCard article={mockArticle} size="compact" showScraping={false} />
                    <ArticleCard article={mockArticle} size="compact" />
                </div>
            </section>

            {/* Default Variant */}
            <section className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                    <h2 className="text-2xl font-bold">Default Variant</h2>
                    <p className="text-muted-foreground">
                        Standaard weergave voor article grids en algemeen gebruik
                    </p>
                    <div className="mt-2 text-sm space-y-1">
                        <p><span className="font-semibold">Image:</span> 192px (h-48)</p>
                        <p><span className="font-semibold">Title:</span> text-xl, 2 lines max</p>
                        <p><span className="font-semibold">Summary:</span> text-sm, 3 lines max</p>
                        <p><span className="font-semibold">Padding:</span> 24px (p-6)</p>
                        <p><span className="font-semibold">Features:</span> Alle features beschikbaar</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ArticleCard article={mockArticle} size="default" showAI={false} />
                    <ArticleCard article={mockArticle} showAI={false} />
                </div>
            </section>

            {/* Large Variant */}
            <section className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                    <h2 className="text-2xl font-bold">Large Variant</h2>
                    <p className="text-muted-foreground">
                        Voor featured articles, hero sections, en detail weergaven
                    </p>
                    <div className="mt-2 text-sm space-y-1">
                        <p><span className="font-semibold">Image:</span> 256px (h-64)</p>
                        <p><span className="font-semibold">Title:</span> text-2xl, 3 lines max</p>
                        <p><span className="font-semibold">Summary:</span> text-base, 4 lines max</p>
                        <p><span className="font-semibold">Padding:</span> 32px (p-8)</p>
                        <p><span className="font-semibold">Features:</span> Alle features met extra spacing</p>
                    </div>
                </div>

                <div className="max-w-4xl">
                    <ArticleCard article={mockArticle} size="large" showAI={false} />
                </div>
            </section>

            {/* Responsive Example */}
            <section className="space-y-4">
                <div className="border-l-4 border-purple-500 pl-4">
                    <h2 className="text-2xl font-bold">Responsive Layout Voorbeeld</h2>
                    <p className="text-muted-foreground">
                        Compact op mobile, default op tablet, grid op desktop
                    </p>
                </div>

                {/* Mobile: Stack compact */}
                <div className="block md:hidden space-y-3">
                    <ArticleCard article={mockArticle} size="compact" />
                    <ArticleCard article={mockArticle} size="compact" />
                    <ArticleCard article={mockArticle} size="compact" />
                </div>

                {/* Tablet: 2 columns default */}
                <div className="hidden md:grid lg:hidden grid-cols-2 gap-4">
                    <ArticleCard article={mockArticle} size="default" />
                    <ArticleCard article={mockArticle} size="default" />
                </div>

                {/* Desktop: 3 columns default */}
                <div className="hidden lg:grid grid-cols-3 gap-6">
                    <ArticleCard article={mockArticle} size="default" />
                    <ArticleCard article={mockArticle} size="default" />
                    <ArticleCard article={mockArticle} size="default" />
                </div>
            </section>

            {/* Comparison */}
            <section className="space-y-4">
                <div className="border-l-4 border-orange-500 pl-4">
                    <h2 className="text-2xl font-bold">Side-by-Side Vergelijking</h2>
                    <p className="text-muted-foreground">
                        Alle drie de variants naast elkaar
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm font-semibold mb-2 text-center">Compact</p>
                        <ArticleCard article={mockArticle} size="compact" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold mb-2 text-center">Default</p>
                        <ArticleCard article={mockArticle} size="default" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold mb-2 text-center">Large</p>
                        <ArticleCard article={mockArticle} size="large" />
                    </div>
                </div>
            </section>

            {/* Usage Instructions */}
            <section className="bg-muted/50 rounded-lg p-6 space-y-4">
                <h2 className="text-2xl font-bold">Gebruik Instructies</h2>
                <div className="space-y-4 text-sm">
                    <div>
                        <h3 className="font-semibold mb-1">Compact Variant:</h3>
                        <code className="bg-background px-2 py-1 rounded">
                            {`<ArticleCard article={article} size="compact" />`}
                        </code>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-1">Default Variant (optioneel):</h3>
                        <code className="bg-background px-2 py-1 rounded">
                            {`<ArticleCard article={article} size="default" />`}
                        </code>
                        <p className="text-muted-foreground mt-1">
                            Of gewoon: <code className="bg-background px-2 py-1 rounded">{`<ArticleCard article={article} />`}</code>
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-1">Large Variant:</h3>
                        <code className="bg-background px-2 py-1 rounded">
                            {`<ArticleCard article={article} size="large" />`}
                        </code>
                    </div>
                </div>
            </section>
        </div>
    );
}