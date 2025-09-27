'use client';

import { useState, useEffect } from 'react';

// Force dynamic rendering for Firebase App Hosting
export const dynamic = 'force-dynamic';
import { Trend, TrendLink } from '@/lib/types';
import { fetchAllData } from '@/lib/data';

export default function BriefsPage() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [trendLinks, setTrendLinks] = useState<TrendLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch trends data
  useEffect(() => {
    async function loadTrends() {
      try {
        setLoading(true);
        console.log('🔄 Starting data fetch for briefs page...');
        const data = await fetchAllData();

        console.log('📊 Fetched data for briefs page:', {
          trendsCount: data.trends.length,
          trendLinksCount: data.trendLinks.length,
          trends: data.trends.map(t => ({ id: t.trend_id, label: t.label, brief_url: t.brief_url })),
          trendLinks: data.trendLinks.map(tl => ({ trend_id: tl.trend_id, url: tl.url, label: tl.label }))
        });

        setTrends(data.trends);
        setTrendLinks(data.trendLinks);
        setError(null);
      } catch (err) {
        console.error('Failed to load trends:', err);
        setError(`Failed to load trends: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }

    loadTrends();
  }, []);

  // Filter trends that have generated briefs (have corresponding trend_links)
  const trendsWithBriefs = trends.filter(trend => {
    const hasLink = trendLinks.some(link => link.trend_id === trend.trend_id);
    const hasBriefUrl = trend.brief_url;
    // Include trends that have either trend_links entries OR brief_url in trends table
    return hasLink || hasBriefUrl;
  }).map(trend => {
    const trendLink = trendLinks.find(link => link.trend_id === trend.trend_id);
    // Prioritize trend_links URL over trends.brief_url
    const finalUrl = trendLink?.url || trend.brief_url;

    console.log(`Brief mapping for ${trend.label}:`, {
      trendId: trend.trend_id,
      trendLinkUrl: trendLink?.url,
      trendBriefUrl: trend.brief_url,
      finalUrl,
      prioritySource: trendLink?.url ? 'trend_links' : 'trends_table'
    });

    return {
      ...trend,
      brief_url: finalUrl,
      brief_source: trendLink?.url ? 'trend_links' : 'trends_table'
    };
  });

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading marketing briefs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Generated Marketing Briefs
              </h1>
              <p className="mt-2 text-gray-600">
                All marketing briefs that have been generated for AI trends
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/data"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 1.79 4 4 4h8c0-2.21-1.79-4-4-4H7c-2.21 0-4-1.79-4-4zm0 0V4c0-2.21 1.79-4 4-4h8c2.21 0 4 1.79 4 4v10c0 2.21-1.79 4-4 4" />
                </svg>
                View All Data
              </a>
              <a
                href="/"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Marketing Briefs ({trendsWithBriefs.length})
              </h2>
              {trendsWithBriefs.length === 0 && (
                <span className="text-sm text-gray-500">
                  No briefs generated yet
                </span>
              )}
            </div>
          </div>

          {trendsWithBriefs.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No marketing briefs</h3>
              <p className="mt-1 text-sm text-gray-500">
                Generate your first marketing brief by going to the dashboard and selecting a trend.
              </p>
              <div className="mt-6">
                <a
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Go to Dashboard
                </a>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {trendsWithBriefs.map((trend) => (
                <div key={trend.trend_id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {trend.label}
                          </h3>
                          <div className="flex items-center mt-1 space-x-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {trend.slug}
                            </span>
                            <span className="text-xs text-gray-500">
                              Generated: {formatDate(trend.created_at)}
                            </span>
                          </div>
                          {trend.alt_names && trend.alt_names.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {trend.alt_names.slice(0, 3).map((altName, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                                >
                                  {altName}
                                </span>
                              ))}
                              {trend.alt_names.length > 3 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
                                  +{trend.alt_names.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Generated
                        </span>
                      </div>
                      <a
                        href={trend.brief_url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {trendsWithBriefs.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  About Marketing Briefs
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Marketing briefs are comprehensive documents containing trend analysis,
                    target audience insights, content recommendations, and campaign strategies
                    for each AI use-case trend. They are automatically generated based on
                    social media engagement data and trend performance metrics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}