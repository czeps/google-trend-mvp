'use client';

import { useState, useMemo, useEffect } from 'react';
import { TrendMetrics, DashboardFilters, Trend, Post, PostTrend } from '@/lib/types';
import { fetchAllData } from '@/lib/data';
import { aggregateTrendMetrics, calculateKPIs } from '@/lib/metrics';
import FiltersBar from '@/components/FiltersBar';
import KPICards from '@/components/KPICards';
import TrendsTable from '@/components/TrendsTable';
import TrendDrawer from '@/components/TrendDrawer';
import TrendsComparison from '@/components/TrendsComparison';
import PostCountChart from '@/components/PostCountChart';

export default function Dashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({
    search_terms: [],
    date_preset: 7,
    min_engagement: 0
  });

  const [selectedTrend, setSelectedTrend] = useState<TrendMetrics | null>(null);
  const [sortBy, setSortBy] = useState<keyof TrendMetrics>('posts');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'comparison' | 'post-count'>('table');

  // Brief generation state - persists across drawer sessions
  const [briefGenerationStates, setBriefGenerationStates] = useState<Record<string, {
    isGenerating: boolean;
    generatedBriefUrl: string | null;
  }>>({});

  // Data state
  const [data, setData] = useState<{
    trends: Trend[];
    posts: Post[];
    postTrends: PostTrend[];
  }>({ trends: [], posts: [], postTrends: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        console.log('🚀 Starting data load...');

        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000)
        );

        const result = await Promise.race([
          fetchAllData(),
          timeoutPromise
        ]);

        console.log('✅ Data loaded successfully');
        setData(result as { trends: Trend[]; posts: Post[]; postTrends: PostTrend[]; });
        setError(null);
      } catch (err) {
        console.error('❌ Failed to load data:', err);

        // For development, let's continue with empty data instead of showing error
        console.log('🔄 Continuing with empty data for development...');
        setData({ trends: [], posts: [], postTrends: [] });
        setError(`Database connection failed: ${err instanceof Error ? err.message : 'Unknown error'}. Showing empty dashboard.`);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const availableSearchTerms = useMemo(() => {
    return Array.from(new Set(data.posts.map(post => post.search_term))).sort();
  }, [data.posts]);

  const trendMetrics = useMemo(() => {
    const metrics = aggregateTrendMetrics(data.trends, data.posts, data.postTrends, filters);
    return metrics.filter(metric => metric.posts.length > 0);
  }, [data, filters]);

  const sortedTrendMetrics = useMemo(() => {
    const sorted = [...trendMetrics].sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === 'trend') {
        aValue = a.trend.label;
        bValue = b.trend.label;
      } else if (sortBy === 'posts') {
        aValue = a.posts.length;
        bValue = b.posts.length;
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return sorted;
  }, [trendMetrics, sortBy, sortOrder]);

  const kpis = useMemo(() => {
    return calculateKPIs(data.trends, data.posts, data.postTrends, filters);
  }, [data, filters]);

  // Initialize brief states from trend data when data loads
  useEffect(() => {
    if (data.trends.length > 0) {
      const initialStates: Record<string, { isGenerating: boolean; generatedBriefUrl: string | null }> = {};
      data.trends.forEach(trend => {
        if (!briefGenerationStates[trend.trend_id]) {
          initialStates[trend.trend_id] = {
            isGenerating: false,
            generatedBriefUrl: trend.brief_url || null
          };
        }
      });

      if (Object.keys(initialStates).length > 0) {
        setBriefGenerationStates(prev => ({ ...prev, ...initialStates }));
      }
    }
  }, [data.trends]);

  // Brief state management functions
  const getBriefState = (trendId: string) => {
    return briefGenerationStates[trendId] || { isGenerating: false, generatedBriefUrl: null };
  };

  const setBriefGenerating = (trendId: string, isGenerating: boolean) => {
    setBriefGenerationStates(prev => ({
      ...prev,
      [trendId]: {
        ...prev[trendId],
        isGenerating,
        generatedBriefUrl: isGenerating ? null : prev[trendId]?.generatedBriefUrl || null
      }
    }));
  };

  const setBriefReady = (trendId: string, briefUrl: string) => {
    setBriefGenerationStates(prev => ({
      ...prev,
      [trendId]: {
        isGenerating: false,
        generatedBriefUrl: briefUrl
      }
    }));
  };

  const handleSort = (field: keyof TrendMetrics) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data from database...</p>
        </div>
      </div>
    );
  }

  // Show error message as a banner instead of blocking the entire app
  const ErrorBanner = error ? (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            {error}
          </p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={() => window.location.reload()}
            className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm hover:bg-yellow-200"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                AI Use-Case Trends
              </h1>
              <p className="mt-2 text-gray-600">
                Dashboard for exploring social posts and detected trends
              </p>
            </div>
            <a
              href="/data"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 1.79 4 4 4h8c0-2.21-1.79-4-4-4H7c-2.21 0-4-1.79-4-4zm0 0V4c0-2.21 1.79-4 4-4h8c2.21 0 4 1.79 4 4v10c0 2.21-1.79 4-4 4" />
              </svg>
              View All Data
            </a>
          </div>
        </div>

        {ErrorBanner}

        <FiltersBar
          filters={filters}
          onFiltersChange={setFilters}
          availableSearchTerms={availableSearchTerms}
        />

        <KPICards kpis={kpis} />

        {/* View Mode Toggle */}
        <div className="mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              📊 Table View
            </button>
            <button
              onClick={() => setViewMode('comparison')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'comparison'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              📈 Comparison View
            </button>
            <button
              onClick={() => setViewMode('post-count')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'post-count'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              📝 Post Count Chart
            </button>
          </div>
        </div>

        {viewMode === 'table' ? (
          <TrendsTable
            trendMetrics={sortedTrendMetrics}
            onRowClick={setSelectedTrend}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        ) : viewMode === 'comparison' ? (
          <TrendsComparison
            trendMetrics={sortedTrendMetrics}
            dateRangeDays={filters.date_preset}
          />
        ) : (
          <PostCountChart
            trendMetrics={sortedTrendMetrics}
            onTrendClick={setSelectedTrend}
          />
        )}

        <TrendDrawer
          trendMetric={selectedTrend}
          onClose={() => setSelectedTrend(null)}
          dateRangeDays={filters.date_preset}
          allPosts={data.posts}
          briefState={selectedTrend ? getBriefState(selectedTrend.trend_id) : { isGenerating: false, generatedBriefUrl: null }}
          onBriefGenerationStart={(trendId) => setBriefGenerating(trendId, true)}
          onBriefReady={(trendId, briefUrl) => setBriefReady(trendId, briefUrl)}
        />
      </div>
    </div>
  );
}