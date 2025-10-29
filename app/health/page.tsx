import { Metadata } from 'next';
import { Activity } from 'lucide-react';
import { HealthDashboard } from '@/components/health';
import {
    cn,
    flexPatterns,
    spacing,
    gap,
    responsiveHeadings,
} from '@/lib/styles/theme';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
    title: 'System Health | Nieuws Scraper',
    description: 'Real-time monitoring van de Nieuws Scraper API en alle services',
    keywords: ['health', 'monitoring', 'status', 'system'],
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HealthPage() {
    return (
        <div className={spacing.lg}>
            {/* Page Header */}
            <div className={spacing.xs}>
                <h1 className={cn(responsiveHeadings.h1, flexPatterns.start, gap.sm)}>
                    <Activity className="h-8 w-8 text-primary" />
                    System Health
                </h1>
                <p className="text-lg text-muted-foreground">
                    Real-time monitoring van de API en alle componenten
                </p>
            </div>

            {/* Health Dashboard */}
            <HealthDashboard />
        </div>
    );
}