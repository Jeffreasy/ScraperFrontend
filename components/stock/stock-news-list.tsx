'use client';

import React from 'react';
import { useStockNews } from '@/lib/hooks/use-stock-news';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink } from 'lucide-react';

interface StockNewsListProps {
    symbol: string;
    limit?: number;
}

export function StockNewsList({ symbol, limit = 5 }: StockNewsListProps) {
    const { news, loading, error } = useStockNews(symbol, limit);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent News</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !news || news.news.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent News</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {error?.message || 'Geen nieuws beschikbaar'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent News</CardTitle>
                <p className="text-sm text-muted-foreground">
                    {news.total} artikel{news.total !== 1 ? 'en' : ''} gevonden
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {news.news.map((item, index) => (
                        <a
                            key={index}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group hover:bg-accent/50 rounded-lg p-3 transition-colors"
                        >
                            <div className="flex gap-3">
                                {item.image && (
                                    <div className="flex-shrink-0">
                                        <img
                                            src={item.image}
                                            alt=""
                                            className="w-20 h-20 object-cover rounded"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2 mb-1">
                                        {item.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                        {item.text}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{item.site}</span>
                                        <span>•</span>
                                        <time dateTime={item.publishedDate}>
                                            {new Date(item.publishedDate).toLocaleDateString('nl-NL', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </time>
                                        <ExternalLink className="w-3 h-3 ml-auto" />
                                    </div>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}