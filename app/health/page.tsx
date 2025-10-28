import { Metadata } from 'next';
import { HealthDashboard } from '@/components/health';

export const metadata: Metadata = {
    title: 'System Health | NieuwsScraper',
    description: 'Monitor de gezondheid van de NieuwsScraper API en services',
};

export default function HealthPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold">System Health</h1>
                <p className="text-lg text-muted-foreground">
                    Real-time monitoring van de API en alle componenten
                </p>
            </div>

            <HealthDashboard />
        </div>
    );
}