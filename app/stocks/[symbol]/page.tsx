import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cva, type VariantProps } from 'class-variance-authority';
import { advancedApiClient } from '@/lib/api/advanced-client';
import { StockQuoteCard } from '@/components/stock';
import { ArticleCard } from '@/components/article-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Article, StockProfile } from '@/lib/types/api';
import { TrendingUp, Building, ExternalLink } from 'lucide-react';
import {
    cn,
    flexPatterns,
    spacing,
    transitions,
    bodyText,
    gap,
    responsiveHeadings,
} from '@/lib/styles/theme';

// ============================================================================
// TYPES
// ============================================================================

interface StockTickerPageProps {
    params: { symbol: string };
}

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const profileCardVariants = cva(
    ['border rounded-lg p-4', transitions.colors],
    {
        variants: {
            variant: {
                default: 'bg-card',
                elevated: 'bg-card shadow-sm',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const definitionListVariants = cva(
    [bodyText.small],
    {
        variants: {
            spacing: {
                compact: 'space-y-2',
                default: 'space-y-3',
                relaxed: 'space-y-4',
            },
        },
        defaultVariants: {
            spacing: 'default',
        },
    }
);

// ============================================================================
// METADATA
// ============================================================================

export async function generateMetadata({ params }: StockTickerPageProps): Promise<Metadata> {
    const { symbol } = params;

    return {
        title: `${symbol.toUpperCase()} - Nieuws & Koersen | Nieuws Scraper`,
        description: `Laatste nieuws en real-time koersinformatie over ${symbol.toUpperCase()}`,
        keywords: ['stock', symbol.toUpperCase(), 'quotes', 'news', 'financial'],
    };
}

// ============================================================================
// DATA FETCHING
// ============================================================================

async function fetchStockData(symbol: string): Promise<{
    articles: Article[];
    profile: StockProfile | null;
}> {
    try {
        const [articlesResponse, profileResponse] = await Promise.all([
            advancedApiClient.getArticlesByTicker(symbol, 20),
            advancedApiClient.getStockProfile(symbol).catch(() => null),
        ]);

        return {
            articles: articlesResponse.success && articlesResponse.data ? articlesResponse.data : [],
            profile: profileResponse?.success && profileResponse.data ? profileResponse.data : null,
        };
    } catch (error) {
        console.error('Failed to fetch stock data:', error);
        return {
            articles: [],
            profile: null,
        };
    }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default async function StockTickerPage({ params }: StockTickerPageProps) {
    const { symbol } = params;
    const upperSymbol = symbol.toUpperCase();

    const { articles, profile } = await fetchStockData(upperSymbol);

    // If no articles found, show 404
    if (articles.length === 0) {
        notFound();
    }

    return (
        <div className={spacing.lg}>
            {/* Page Header */}
            <PageHeader symbol={upperSymbol} />

            <div className={cn('grid grid-cols-1 lg:grid-cols-3', gap.lg)}>
                {/* Left sidebar: Stock info */}
                <div className={cn('lg:col-span-1', spacing.md)}>
                    <StockQuoteCard symbol={upperSymbol} />
                    {profile && <CompanyProfile profile={profile} />}
                </div>

                {/* Right content: News articles */}
                <div className={cn('lg:col-span-2', spacing.lg)}>
                    <ArticlesSection articles={articles} symbol={upperSymbol} />
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// SUB COMPONENTS
// ============================================================================

function PageHeader({ symbol }: { symbol: string }) {
    return (
        <div className={spacing.xs}>
            <h1 className={cn(responsiveHeadings.h1, flexPatterns.start, gap.sm)}>
                <TrendingUp className="h-8 w-8 text-primary" />
                {symbol}
            </h1>
            <p className="text-lg text-muted-foreground">Nieuws en koersinformatie</p>
        </div>
    );
}

function CompanyProfile({ profile }: { profile: StockProfile }) {
    return (
        <div className={profileCardVariants()}>
            <h3 className={cn('font-bold text-lg mb-4', flexPatterns.start, gap.sm)}>
                <Building className="h-5 w-5 text-primary" />
                Bedrijfsinformatie
            </h3>

            <dl className={definitionListVariants()}>
                <ProfileItem label="Bedrijfsnaam" value={profile.company_name} />
                {profile.industry && <ProfileItem label="Industrie" value={profile.industry} />}
                {profile.sector && <ProfileItem label="Sector" value={profile.sector} />}
                {profile.country && <ProfileItem label="Land" value={profile.country} />}
                {profile.website && (
                    <div>
                        <dt className="font-medium text-muted-foreground">Website</dt>
                        <dd className="mt-1">
                            <a
                                href={profile.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn('text-primary', 'hover:underline break-all', 'inline-flex items-center gap-1', transitions.colors)}
                            >
                                {profile.website}
                                <ExternalLink className="h-3 w-3 inline" />
                            </a>
                        </dd>
                    </div>
                )}
                {profile.ceo && <ProfileItem label="CEO" value={profile.ceo} />}
                {profile.ipo_date && (
                    <ProfileItem
                        label="IPO Datum"
                        value={new Date(profile.ipo_date).toLocaleDateString('nl-NL')}
                    />
                )}
            </dl>

            {profile.description && (
                <div className="mt-4 pt-4 border-t">
                    <dt className="font-medium text-muted-foreground mb-2">Beschrijving</dt>
                    <dd className={cn(bodyText.small, 'text-muted-foreground leading-relaxed')}>
                        {profile.description}
                    </dd>
                </div>
            )}
        </div>
    );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="font-medium text-muted-foreground">{label}</dt>
            <dd className="mt-1">{value}</dd>
        </div>
    );
}

function ArticlesSection({ articles, symbol }: { articles: Article[]; symbol: string }) {
    return (
        <div className={spacing.lg}>
            <div className={spacing.xs}>
                <h2 className="text-2xl font-bold">Nieuws over {symbol}</h2>
                <p className={cn(bodyText.small, 'text-muted-foreground')}>
                    {articles.length} artikel{articles.length !== 1 ? 'en' : ''} gevonden
                </p>
            </div>

            <div className={cn('grid gap-6')}>
                {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                ))}
            </div>
        </div>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

// Note: CVA variants are not exported from page components to avoid Next.js type conflicts
// Use these variants only within this component file