import { Metadata } from 'next';
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, Info, ExternalLink, CheckCircle } from 'lucide-react';
import {
    cn,
    flexPatterns,
    spacing,
    transitions,
    bodyText,
    gap,
    responsiveHeadings,
    gridLayouts,
} from '@/lib/styles/theme';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
    title: 'Stock Market | Nieuws Scraper',
    description: 'Real-time stock market data, earnings calendar en financial news integration',
    keywords: ['stocks', 'market', 'earnings', 'finance', 'quotes'],
};

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const stockCardVariants = cva(
    ['block p-4 border rounded-lg group', transitions.colors],
    {
        variants: {
            variant: {
                default: 'hover:bg-accent/50',
                elevated: 'hover:bg-accent hover:shadow-md',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const featureListItemVariants = cva(
    ['flex items-start gap-2', bodyText.small],
    {
        variants: {
            checked: {
                true: 'text-foreground',
                false: 'text-muted-foreground',
            },
        },
        defaultVariants: {
            checked: true,
        },
    }
);

// ============================================================================
// DATA
// ============================================================================

const popularUsStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'AMD', name: 'Advanced Micro Devices' },
];

const features = [
    'Real-time stock quotes voor US aandelen',
    'Company profiles met bedrijfsinformatie',
    'Earnings calendar (upcoming 2 weeks)',
    'Articles filtered by stock ticker',
    'Historical price charts',
    'Financial metrics en key statistics',
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function StocksPage() {
    return (
        <div className={spacing.lg}>
            {/* Page Header */}
            <PageHeader />

            {/* Free Tier Notice */}
            <FreeTierNotice />

            <div className={cn('grid grid-cols-1 lg:grid-cols-3', gap.lg)}>
                {/* Popular US Stocks */}
                <div className="lg:col-span-2 space-y-6">
                    <PopularStocksCard />
                    <FeaturesCard />
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-4 space-y-6">
                        <DemoCard />
                        <QuickLinksCard />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// SUB COMPONENTS
// ============================================================================

function PageHeader() {
    return (
        <div className={spacing.xs}>
            <h1 className={cn(responsiveHeadings.h1, flexPatterns.start, gap.sm)}>
                <TrendingUp className="h-8 w-8 text-primary" />
                Stock Market
            </h1>
            <p className="text-lg text-muted-foreground">
                Real-time stock quotes and market calendar
            </p>
        </div>
    );
}

function FreeTierNotice() {
    return (
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
                <div className={cn('flex items-start', gap.sm)}>
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold mb-2">FMP Free Tier Active</h3>
                        <p className={cn(bodyText.small, 'text-muted-foreground')}>
                            Currently showing US stocks only. Click on any stock below to see real-time quotes
                            and related news articles.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function PopularStocksCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className={cn(flexPatterns.start, gap.sm)}>
                    <TrendingUp className="w-5 h-5" />
                    Popular US Stocks
                </CardTitle>
                <p className={cn(bodyText.small, 'text-muted-foreground')}>
                    Click to view real-time quotes and related news
                </p>
            </CardHeader>
            <CardContent>
                <div className={cn('grid grid-cols-1 sm:grid-cols-2', gap.sm)}>
                    {popularUsStocks.map((stock) => (
                        <Link key={stock.symbol} href={`/stocks/${stock.symbol}`} className={stockCardVariants()}>
                            <div className={flexPatterns.between}>
                                <div>
                                    <div className={cn('font-bold text-lg', 'group-hover:text-primary', transitions.colors)}>
                                        {stock.symbol}
                                    </div>
                                    <div className={cn(bodyText.small, 'text-muted-foreground')}>{stock.name}</div>
                                </div>
                                <TrendingUp className={cn('w-5 h-5 text-muted-foreground', 'group-hover:text-primary', transitions.colors)} />
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function FeaturesCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>📊 Available Features</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className={spacing.xs}>
                    {features.map((feature) => (
                        <li key={feature} className={featureListItemVariants()}>
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

function DemoCard() {
    return (
        <Link href="/stocks-demo" className="block">
            <Card className={cn('hover:bg-accent/50 cursor-pointer border-primary/50', transitions.colors, 'hover:shadow-md')}>
                <CardContent className="pt-6">
                    <div className="text-center">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-primary" />
                        <h3 className="font-semibold mb-2">Full Demo</h3>
                        <p className={cn(bodyText.small, 'text-muted-foreground')}>
                            View all stock market features
                        </p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

function QuickLinksCard() {
    const links = [
        { href: '/stocks-demo', label: 'Stock Demo Dashboard' },
        { href: '/stocks-demo/debug', label: 'API Debug Tool' },
        { href: '/ai', label: 'AI Insights with Earnings' },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
                <div className={spacing.xs}>
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn('block text-primary', 'hover:underline', transitions.colors, bodyText.small)}
                        >
                            → {link.label}
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    stockCardVariants,
    featureListItemVariants,
};