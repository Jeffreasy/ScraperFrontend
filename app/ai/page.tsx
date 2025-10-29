import { Metadata } from 'next';
import { cva, type VariantProps } from 'class-variance-authority';
import { TrendingTopics } from '@/components/ai/trending-topics';
import { SentimentDashboard } from '@/components/ai/sentiment-dashboard';
import { EarningsCalendar } from '@/components/stock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Flame,
    Smile,
    Users,
    Tag,
    Key,
    Sparkles,
} from 'lucide-react';
import {
    cn,
    flexPatterns,
    spacing,
    bodyText,
    gap,
    responsiveHeadings,
    cardStyles,
} from '@/lib/styles/theme';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
    title: 'AI Insights | Nieuws Scraper',
    description: 'AI-powered news analysis, sentiment detection, trending topics, and intelligent entity extraction',
    keywords: ['AI', 'sentiment analysis', 'trending topics', 'machine learning', 'NLP'],
};

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const featureCardVariants = cva(
    ['transition-all duration-200'],
    {
        variants: {
            variant: {
                default: 'hover:bg-muted/80',
                elevated: 'hover:shadow-sm',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const sectionContainerVariants = cva(
    ['p-6 rounded-lg', 'transition-colors duration-200'],
    {
        variants: {
            variant: {
                default: 'bg-muted',
                gradient: 'bg-gradient-to-br from-muted to-muted/50',
                elevated: 'bg-card border',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AIPage() {
    return (
        <div className={spacing.lg}>
            {/* Page Header */}
            <PageHeader />

            {/* Main Dashboard Grid */}
            <div className={cn('grid grid-cols-1 lg:grid-cols-3', gap.lg, 'mb-8')}>
                <div className="lg:col-span-1">
                    <TrendingTopics hours={24} minArticles={3} />
                </div>
                <div className="lg:col-span-2">
                    <SentimentDashboard />
                </div>
            </div>

            {/* Market Insights Section */}
            <div className={cn('grid grid-cols-1 lg:grid-cols-3', gap.lg)}>
                <div className="lg:col-span-2">
                    <h2 className={cn('text-2xl font-bold mb-4', flexPatterns.start, gap.sm)}>
                        📊 Market Insights
                    </h2>
                    <p className={cn(bodyText.base, 'text-muted-foreground mb-4')}>
                        AI-powered analysis combined with market timing intelligence
                    </p>
                </div>
                <div className="lg:col-span-1">
                    <EarningsCalendar daysAhead={14} limit={8} compact={true} />
                </div>
            </div>

            {/* AI Features Information */}
            <AIFeaturesInfo />
        </div>
    );
}

// ============================================================================
// SUB COMPONENTS
// ============================================================================

function PageHeader() {
    return (
        <div className="mb-8">
            <h1 className={responsiveHeadings.h1}>AI Insights</h1>
            <p className={cn('text-lg text-muted-foreground')}>
                Discover trending topics and sentiment analysis powered by artificial intelligence
            </p>
        </div>
    );
}

function AIFeaturesInfo() {
    const features = [
        {
            icon: Flame,
            title: 'Trending Topics',
            description: "Discover what's trending based on article frequency, recency, and engagement. Topics are updated in real-time and show sentiment distribution.",
        },
        {
            icon: Smile,
            title: 'Sentiment Analysis',
            description: 'AI-powered sentiment detection analyzes the emotional tone of articles, classifying them as positive, neutral, or negative with confidence scores.',
        },
        {
            icon: Users,
            title: 'Entity Extraction',
            description: 'Automatically identifies people, organizations, and locations mentioned in articles, making it easy to find related news.',
        },
        {
            icon: Tag,
            title: 'Smart Categories',
            description: "Articles are automatically categorized using AI, with confidence scores for each category to help you find exactly what you're looking for.",
        },
        {
            icon: Key,
            title: 'Keyword Extraction',
            description: 'AI extracts the most relevant keywords from articles with relevance scores, helping you understand the main topics at a glance.',
        },
        {
            icon: Sparkles,
            title: 'AI Summaries',
            description: 'Get concise AI-generated summaries of articles, perfect for quickly understanding the content without reading the full text.',
        },
    ];

    return (
        <div className={sectionContainerVariants({ variant: 'gradient' })}>
            <h2 className="text-xl font-semibold mb-4">About AI Features</h2>
            <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3', gap.lg, bodyText.small)}>
                {features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                        <FeatureCard
                            key={feature.title}
                            icon={<Icon className="h-5 w-5" />}
                            title={feature.title}
                            description={feature.description}
                        />
                    );
                })}
            </div>
        </div>
    );
}

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
        <div className={featureCardVariants()}>
            <div className={cn(flexPatterns.start, gap.sm, 'mb-2')}>
                <div className="text-primary">{icon}</div>
                <h3 className="font-semibold">{title}</h3>
            </div>
            <p className="text-muted-foreground">{description}</p>
        </div>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    featureCardVariants,
    sectionContainerVariants,
};