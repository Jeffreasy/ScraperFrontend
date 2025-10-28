'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSymbolSearch } from '@/lib/hooks/use-symbol-search';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, TrendingUp } from 'lucide-react';

interface SymbolSearchProps {
    placeholder?: string;
    onSelect?: (symbol: string) => void;
}

export function SymbolSearch({ placeholder = 'Zoek aandeel...', onSelect }: SymbolSearchProps) {
    const [query, setQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const { results, loading, search } = useSymbolSearch();
    const router = useRouter();

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2) {
                search(query, 10);
                setShowResults(true);
            } else {
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, search]);

    const handleSelect = useCallback((symbol: string) => {
        if (onSelect) {
            onSelect(symbol);
        } else {
            router.push(`/stocks/${symbol}`);
        }
        setQuery('');
        setShowResults(false);
    }, [onSelect, router]);

    const handleBlur = useCallback(() => {
        // Delay to allow click on result
        setTimeout(() => setShowResults(false), 200);
    }, []);

    return (
        <div className="relative w-full">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setShowResults(true)}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    className="pl-9"
                />
            </div>

            {showResults && (
                <Card className="absolute top-full mt-1 w-full z-50 max-h-96 overflow-y-auto shadow-lg">
                    {loading && (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                            Zoeken...
                        </div>
                    )}

                    {!loading && results && results.results.length === 0 && (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                            Geen resultaten gevonden voor "{query}"
                        </div>
                    )}

                    {!loading && results && results.results.length > 0 && (
                        <ul className="py-2">
                            {results.results.map((result) => (
                                <li key={result.symbol}>
                                    <button
                                        onClick={() => handleSelect(result.symbol)}
                                        className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center justify-between group"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-sm">
                                                    {result.symbol}
                                                </span>
                                                <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
                                                    {result.exchange}
                                                </span>
                                            </div>
                                            <div className="text-sm text-muted-foreground truncate">
                                                {result.company_name}
                                            </div>
                                            {result.exchangeShortName && (
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    {result.currency} • {result.exchangeShortName}
                                                </div>
                                            )}
                                        </div>
                                        <TrendingUp className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            )}
        </div>
    );
}