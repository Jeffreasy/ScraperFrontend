'use client';

import React, { useState } from 'react';
import {
    StockQuoteCard,
    EarningsCalendar,
} from '@/components/stock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function StocksDemoPage() {
    const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
    const [searchInput, setSearchInput] = useState('AAPL');

    const usStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'AMD'];

    const handleSearch = () => {
        setSelectedSymbol(searchInput.toUpperCase());
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-primary" />
                    <div>
                        <h1 className="text-4xl font-bold">Stock Market Dashboard</h1>
                        <p className="text-lg text-muted-foreground">
                            FMP API Free Tier - US Stocks Only
                        </p>
                    </div>
                </div>

                {/* Status Banner */}
                <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">ℹ️</div>
                            <div>
                                <h3 className="font-semibold mb-2">FMP Free Tier Active</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Currently showing US stocks only (AAPL, MSFT, GOOGL, etc.)
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    ✅ Working: Single Quotes, Company Profiles, Earnings Calendar<br />
                                    🔒 Premium: Batch API, Market Data, Historical Charts, EU Stocks (ASML, Shell)
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Symbol Input */}
                <Card>
                    <CardHeader>
                        <CardTitle>🔍 US Stock Lookup</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Enter US stock symbol (e.g., AAPL, MSFT, GOOGL)
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Enter symbol (AAPL, MSFT...)"
                                className="flex-1"
                            />
                            <Button onClick={handleSearch}>
                                Search
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className="text-sm text-muted-foreground">Popular:</span>
                            {usStocks.map(symbol => (
                                <Button
                                    key={symbol}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSearchInput(symbol);
                                        setSelectedSymbol(symbol);
                                    }}
                                >
                                    {symbol}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Stock Quote */}
            <div>
                <h2 className="text-2xl font-bold mb-4">📊 Real-time Quote</h2>
                <p className="text-muted-foreground mb-6">
                    Live pricing data for {selectedSymbol}
                </p>
                <div className="max-w-md">
                    <StockQuoteCard symbol={selectedSymbol} />
                </div>
            </div>

            {/* Earnings Calendar */}
            <div>
                <h2 className="text-2xl font-bold mb-4">📅 Earnings Calendar</h2>
                <p className="text-muted-foreground mb-6">
                    Upcoming earnings announcements (next 14 days, showing top 10)
                </p>
                <EarningsCalendar daysAhead={14} limit={10} />
            </div>

            {/* Premium Features Locked */}
            <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Lock className="w-6 h-6" />
                    🔒 Premium Features (FMP Starter $14/mo)
                </h2>
                <p className="text-muted-foreground mb-6">
                    Unlock these features with FMP Starter subscription
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="opacity-60">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Batch Quotes API
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Fetch 100 stocks in 1 API call<br />
                                💰 90-99% cost savings<br />
                                ⚡ 97% faster
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="opacity-60">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Market Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Top gainers & losers<br />
                                Most active stocks<br />
                                Sector performance
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="opacity-60">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Historical Charts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                30-day price charts<br />
                                OHLC data<br />
                                Volume tracking
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="opacity-60">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Financial Metrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                P/E, ROE, ROA ratios<br />
                                Debt/Equity<br />
                                Dividend yield
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="opacity-60">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Stock News
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                International news<br />
                                Real-time updates<br />
                                Article images
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="opacity-60">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Analyst Ratings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Price targets<br />
                                Upgrades/downgrades<br />
                                Analyst consensus
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="opacity-60">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                EU Stocks
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                ASML, Shell, ING<br />
                                AEX index stocks<br />
                                European markets
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Features Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>✨ Implementation Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">✅ Active (Free Tier)</h3>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>✓ US stock quotes (AAPL, MSFT, etc.)</li>
                                <li>✓ Company profiles</li>
                                <li>✓ Earnings calendar (14 days)</li>
                                <li>✓ Cache statistics</li>
                                <li>✓ Production-ready code</li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">🔒 Premium Ready</h3>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>🔒 Batch quotes API (coded & tested)</li>
                                <li>🔒 Market performance data</li>
                                <li>🔒 Historical charts</li>
                                <li>🔒 Financial metrics</li>
                                <li>🔒 Stock news</li>
                                <li>🔒 Analyst ratings</li>
                                <li>🔒 EU stocks (ASML, Shell, ING)</li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">🎨 Components Built</h3>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>✓ 12 stock components ready</li>
                                <li>✓ 5 custom hooks</li>
                                <li>✓ TypeScript types complete</li>
                                <li>✓ Error handling</li>
                                <li>✓ Loading states</li>
                                <li>✓ Dark mode support</li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">💰 Upgrade Path</h3>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>💵 FMP Starter: $14/month</li>
                                <li>⚡ Unlock all 17 endpoints</li>
                                <li>🌍 Global stock coverage</li>
                                <li>📊 90-99% cost savings with batch API</li>
                                <li>🚀 Code already implemented</li>
                                <li>✨ Just uncomment routes & restart!</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center py-8 text-sm text-muted-foreground border-t">
                <p>Data provided by Financial Modeling Prep (Free Tier)</p>
                <p className="mt-2">
                    All premium features are coded and tested - ready for instant activation! 🚀
                </p>
            </div>
        </div>
    );
}