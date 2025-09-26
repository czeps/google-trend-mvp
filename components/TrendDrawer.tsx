import { useState, useEffect } from 'react';
import { TrendMetrics, Post } from '@/lib/types';
import { calculateEngagementScore, generateSparklineData } from '@/lib/metrics';
import { useBriefPolling } from '@/lib/useBriefPolling';
import Sparkline from './Sparkline';
import MarketingBriefModal from './MarketingBriefModal';

interface BriefState {
  isGenerating: boolean;
  generatedBriefUrl: string | null;
}

interface TrendDrawerProps {
  trendMetric: TrendMetrics | null;
  onClose: () => void;
  dateRangeDays: number;
  allPosts?: Post[];
  briefState?: BriefState;
  onBriefGenerationStart?: (trendId: string) => void;
  onBriefReady?: (trendId: string, briefUrl: string) => void;
}

export default function TrendDrawer({
  trendMetric,
  onClose,
  dateRangeDays,
  allPosts,
  briefState,
  onBriefGenerationStart,
  onBriefReady
}: TrendDrawerProps) {
  if (!trendMetric) return null;

  const [showBriefModal, setShowBriefModal] = useState(false);

  // Use state from parent component (persists across drawer sessions)
  const isGeneratingBrief = briefState?.isGenerating || false;
  const generatedBriefUrl = briefState?.generatedBriefUrl || null;

  // Use polling hook to check for brief generation
  useBriefPolling({
    trendId: trendMetric.trend_id,
    isPolling: isGeneratingBrief,
    onBriefReady: (briefUrl) => {
      onBriefReady?.(trendMetric.trend_id, briefUrl);
    },
    onError: (error) => {
      console.error('Brief polling error:', error);
      // Stop polling on error by notifying parent
      onBriefReady?.(trendMetric.trend_id, generatedBriefUrl || '');
    }
  });

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sparklineData = generateSparklineData(trendMetric.posts, dateRangeDays);

  const topPosts = trendMetric.posts
    .map(post => ({
      ...post,
      engagement: calculateEngagementScore(post)
    }))
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, 5);

  const handleBriefGenerated = (briefId: string) => {
    // Brief generation request submitted - start polling
    console.log('Brief generation started for:', briefId);
    setShowBriefModal(false);
    // Note: polling will be started by the parent component state
  };

  const handleBriefGenerationStart = () => {
    onBriefGenerationStart?.(trendMetric.trend_id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {trendMetric.trend.label}
              </h2>
              <p className="text-sm text-gray-500">{trendMetric.trend.slug}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Daily Engagement</h3>

                {/* Brief Generation States */}
                {isGeneratingBrief ? (
                  // Loading State
                  <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Generating Brief...
                  </div>
                ) : generatedBriefUrl ? (
                  // Completed State - Show download button
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <a
                        href={generatedBriefUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Brief PDF
                      </a>
                      <button
                        onClick={() => setShowBriefModal(true)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Generate New Brief
                      </button>
                    </div>
                    <p className="text-xs text-gray-600">
                      Brief has been generated and is ready for download
                    </p>
                  </div>
                ) : (
                  // Initial State
                  <button
                    onClick={() => setShowBriefModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generate Marketing Brief
                  </button>
                )}
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                <Sparkline data={sparklineData} width={480} height={140} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Top Posts ({topPosts.length})
              </h3>
              <div className="space-y-4">
                {topPosts.map((post) => (
                  <div key={post.post_id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="mb-3">
                      <p className="text-sm text-gray-900 leading-relaxed">
                        {post.text}
                      </p>
                    </div>

                    <div className="flex justify-between items-start mb-3">
                      <div className="text-xs text-gray-500">
                        {formatDate(post.created_at)}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        Total: {formatNumber(post.engagement)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{formatNumber(post.like_count)}</div>
                        <div className="text-gray-500">Likes</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{formatNumber(post.retweet_count)}</div>
                        <div className="text-gray-500">Retweets</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{formatNumber(post.reply_count)}</div>
                        <div className="text-gray-500">Replies</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{formatNumber(post.bookmark_count)}</div>
                        <div className="text-gray-500">Bookmarks</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        View original post →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <MarketingBriefModal
        isOpen={showBriefModal}
        onClose={() => setShowBriefModal(false)}
        trendMetric={trendMetric}
        allPosts={allPosts || []}
        onGenerationStart={handleBriefGenerationStart}
        onGenerationComplete={handleBriefGenerated}
      />
    </div>
  );
}