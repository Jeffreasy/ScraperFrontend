import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { advancedApiClient } from '@/lib/api/advanced-client';
import { StockQuoteCard } from '@/components/stock';
import { ArticleCard } from '@/components/article-card';
import { Article, StockProfile } from '@/lib/types/api';

interface StockTickerPageProps {
    params: { symbol: string };
}

export async function generateMetadata({ params }: StockTickerPageProps): Promise<Metadata> {
    const { symbol } = params;

    return {
        title: `${symbol.toUpperCase()} - Nieuws & Koersen`,
        description: `Laatste nieuws en koersinformatie over ${symbol.toUpperCase()}`,
    };
}

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

export default async function StockTickerPage({ params }: StockTickerPageProps) {
    const { symbol } = params;
    const upperSymbol = symbol.toUpperCase();

    const { articles, profile } = await fetchStockData(upperSymbol);

    // If no articles found, show 404
    if (articles.length === 0) {
        notFound();
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-4xl font-bold">{upperSymbol}</h1>
                <p className="text-lg text-muted-foreground">
                    Nieuws en koersinformatie
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left sidebar: Stock info */}
                <div className="lg:col-span-1 space-y-4">
                    <StockQuoteCard symbol={upperSymbol} />

                    {profile && (
                        <div className="border rounded-lg p-4 space-y-4">
                            <h3 className="font-bold text-lg">Bedrijfsinformatie</h3>

                            <dl className="space-y-3 text-sm">
                                <div>
                                    <dt className="font-medium text-muted-foreground">Bedrijfsnaam</dt>
                                    <dd className="mt-1">{profile.company_name}</dd>
                                </div>

                                {profile.industry && (
                                    <div>
                                        <dt className="font-medium text-muted-foreground">Industrie</dt>
                                        <dd className="mt-1">{profile.industry}</dd>
                                    </div>
                                )}

                                {profile.sector && (
                                    <div>
                                        <dt className="font-medium text-muted-foreground">Sector</dt>
                                        <dd className="mt-1">{profile.sector}</dd>
                                    </div>
                                )}

                                {profile.country && (
                                    <div>
                                        <dt className="font-medium text-muted-foreground">Land</dt>
                                        <dd className="mt-1">{profile.country}</dd>
                                    </div>
                                )}

                                {profile.website && (
                                    <div>
                                        <dt className="font-medium text-muted-foreground">Website</dt>
                                        <dd className="mt-1">
                                            <a
                                                href={profile.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline break-all"
                                            >
                                                {profile.website}
                                            </a>
                                        </dd>
                                    </div>
                                )}

                                {profile.ceo && (
                                    <div>
                                        <dt className="font-medium text-muted-foreground">CEO</dt>
                                        <dd className="mt-1">{profile.ceo}</dd>
                                    </div>
                                )}

                                {profile.ipo_date && (
                                    <div>
                                        <dt className="font-medium text-muted-foreground">IPO Datum</dt>
                                        <dd className="mt-1">{new Date(profile.ipo_date).toLocaleDateString('nl-NL')}</dd>
                                    </div>
                                )}
                            </dl>

                            {profile.description && (
                                <div>
                                    <dt className="font-medium text-muted-foreground mb-2">Beschrijving</dt>
                                    <dd className="text-sm text-muted-foreground leading-relaxed">
                                        {profile.description}
                                    </dd>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right content: News articles */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-4">
                            Nieuws over {upperSymbol}
                        </h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            {articles.length} artikel{articles.length !== 1 ? 'en' : ''} gevonden
                        </p>
                    </div>

                    <div className="grid gap-6">
                        {articles.map((article) => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}