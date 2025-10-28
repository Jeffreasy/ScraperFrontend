import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar, Info } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Stock Market | NieuwsScraper',
    description: 'Stock market data and earnings calendar',
};

export default function StocksPage() {
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

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Stock Market</h1>
                <p className="text-muted-foreground">
                    Real-time stock quotes and market calendar
                </p>
            </div>

            {/* Free Tier Notice */}
            <Card className="mb-8 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold mb-2">FMP Free Tier Active</h3>
                            <p className="text-sm text-muted-foreground">
                                Currently showing US stocks only. Click on any stock below to see real-time quotes and related news articles.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Popular US Stocks */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Popular US Stocks
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Click to view real-time quotes and related news
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {popularUsStocks.map((stock) => (
                                    <Link
                                        key={stock.symbol}
                                        href={`/stocks/${stock.symbol}`}
                                        className="block p-4 border rounded-lg hover:bg-accent/50 transition-colors group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-bold text-lg group-hover:text-primary transition-colors">
                                                    {stock.symbol}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {stock.name}
                                                </div>
                                            </div>
                                            <TrendingUp className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Demo Features */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>📊 Available Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 dark:text-green-400">✓</span>
                                    <span>Real-time stock quotes voor US aandelen</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 dark:text-green-400">✓</span>
                                    <span>Company profiles met bedrijfsinformatie</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 dark:text-green-400">✓</span>
                                    <span>Earnings calendar (upcoming 2 weeks)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 dark:text-green-400">✓</span>
                                    <span>Articles filtered by stock ticker</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Earnings Calendar Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-4">
                        <Link href="/stocks-demo" className="block mb-6">
                            <Card className="hover:bg-accent/50 transition-colors cursor-pointer border-primary/50">
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <Calendar className="w-12 h-12 mx-auto mb-3 text-primary" />
                                        <h3 className="font-semibold mb-2">Full Demo</h3>
                                        <p className="text-sm text-muted-foreground">
                                            View all stock market features
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Links</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <Link href="/stocks-demo" className="block text-primary hover:underline">
                                        → Stock Demo Dashboard
                                    </Link>
                                    <Link href="/stocks-demo/debug" className="block text-primary hover:underline">
                                        → API Debug Tool
                                    </Link>
                                    <Link href="/ai" className="block text-primary hover:underline">
                                        → AI Insights with Earnings
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}