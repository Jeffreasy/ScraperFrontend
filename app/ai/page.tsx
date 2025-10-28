import { Metadata } from 'next';
import { TrendingTopics } from '@/components/ai/trending-topics';
import { SentimentDashboard } from '@/components/ai/sentiment-dashboard';

export const metadata: Metadata = {
    title: 'AI Insights | NieuwsScraper',
    description: 'AI-powered news analysis and insights',
};

export default function AIPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">AI Insights</h1>
                <p className="text-muted-foreground">
                    Discover trending topics and sentiment analysis powered by artificial intelligence
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trending Topics - Takes 1 column */}
                <div className="lg:col-span-1">
                    <TrendingTopics hours={24} minArticles={3} />
                </div>

                {/* Sentiment Dashboard - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <SentimentDashboard />
                </div>
            </div>

            <div className="mt-8 p-6 bg-muted rounded-lg">
                <h2 className="text-xl font-semibold mb-4">About AI Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <span className="text-lg">🔥</span>
                            Trending Topics
                        </h3>
                        <p className="text-muted-foreground">
                            Discover what&apos;s trending based on article frequency, recency, and engagement.
                            Topics are updated in real-time and show sentiment distribution.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <span className="text-lg">😊</span>
                            Sentiment Analysis
                        </h3>
                        <p className="text-muted-foreground">
                            AI-powered sentiment detection analyzes the emotional tone of articles,
                            classifying them as positive, neutral, or negative with confidence scores.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <span className="text-lg">👤</span>
                            Entity Extraction
                        </h3>
                        <p className="text-muted-foreground">
                            Automatically identifies people, organizations, and locations mentioned in articles,
                            making it easy to find related news.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <span className="text-lg">🏷️</span>
                            Smart Categories
                        </h3>
                        <p className="text-muted-foreground">
                            Articles are automatically categorized using AI, with confidence scores
                            for each category to help you find exactly what you&apos;re looking for.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <span className="text-lg">🔑</span>
                            Keyword Extraction
                        </h3>
                        <p className="text-muted-foreground">
                            AI extracts the most relevant keywords from articles with relevance scores,
                            helping you understand the main topics at a glance.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <span className="text-lg">✨</span>
                            AI Summaries
                        </h3>
                        <p className="text-muted-foreground">
                            Get concise AI-generated summaries of articles, perfect for quickly
                            understanding the content without reading the full text.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}