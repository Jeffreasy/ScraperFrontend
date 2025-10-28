'use client';

import { useQuery } from '@tanstack/react-query';
import { TrendingUp, FileText, Clock, Calendar } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, getCategoryIcon } from '@/lib/utils';

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: any;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

export default function StatsPage() {
  // Fetch statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => apiClient.getArticleStats(),
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch health status
  const { data: healthData } = useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.healthCheck(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const stats = statsData?.success ? statsData.data : null;
  const health = healthData?.success ? healthData.data : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Statistieken</h1>
        <p className="text-lg text-muted-foreground">
          Overzicht van de nieuws database
        </p>
      </div>

      {/* System Health */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Status Systeem
              <span
                className={`inline-flex h-2 w-2 rounded-full ${
                  health.status === 'healthy'
                    ? 'bg-green-500 animate-pulse'
                    : 'bg-red-500'
                }`}
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Service</p>
                <p className="font-medium">{health.service}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Versie</p>
                <p className="font-medium">{health.version}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Database</p>
                <p className="font-medium capitalize">{health.checks?.database?.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : stats ? (
          <>
            <StatCard
              title="Totaal Artikelen"
              value={stats.total_articles.toLocaleString('nl-NL')}
              icon={FileText}
              description="In de database"
            />
            <StatCard
              title="Laatste 24 Uur"
              value={stats.recent_articles_24h.toLocaleString('nl-NL')}
              icon={Clock}
              description="Nieuw toegevoegd"
            />
            <StatCard
              title="Nieuwsbronnen"
              value={Object.keys(stats.articles_by_source).length}
              icon={TrendingUp}
              description="Actieve bronnen"
            />
            <StatCard
              title="Categorieën"
              value={Object.keys(stats.categories).length}
              icon={Calendar}
              description="Verschillende categorieën"
            />
          </>
        ) : null}
      </div>

      {/* Articles by Source */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Artikelen per Bron</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.articles_by_source)
                .sort(([, a], [, b]) => b - a)
                .map(([source, count]) => {
                  const percentage =
                    (count / stats.total_articles) * 100;
                  return (
                    <div key={source} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{source}</span>
                        <span className="text-muted-foreground">
                          {count.toLocaleString('nl-NL')} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Grid */}
      {stats && stats.categories && (
        <Card>
          <CardHeader>
            <CardTitle>Categorieën</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Object.entries(stats.categories)
                .sort(([, a], [, b]) => b.article_count - a.article_count)
                .map(([name, category]) => (
                  <Card key={name} className="text-center">
                    <CardContent className="pt-6">
                      <div className="text-3xl mb-2">
                        {getCategoryIcon(name)}
                      </div>
                      <p className="font-medium text-sm mb-1">{name}</p>
                      <p className="text-2xl font-bold text-primary">
                        {category.article_count.toLocaleString('nl-NL')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Date Range Info */}
      {stats && (stats.oldest_article || stats.newest_article) && (
        <Card>
          <CardHeader>
            <CardTitle>Datum Bereik</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stats.oldest_article && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Oudste artikel
                  </p>
                  <p className="font-medium">
                    {formatDate(stats.oldest_article)}
                  </p>
                </div>
              )}
              {stats.newest_article && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Nieuwste artikel
                  </p>
                  <p className="font-medium">
                    {formatDate(stats.newest_article)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}