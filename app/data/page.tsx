'use client';

import { useState, useMemo, useEffect } from 'react';

// Force dynamic rendering for Firebase App Hosting
export const dynamic = 'force-dynamic';
import { Post, Trend, PostTrend, TrendLink } from '@/lib/types';
import { fetchAllData } from '@/lib/data';
import { calculateEngagementScore } from '@/lib/metrics';

export default function DataShowcase() {
  const [activeTab, setActiveTab] = useState<'posts' | 'trends'>('posts');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'engagement' | 'alphabet'>('date');
  const [filterPlatform, setFilterPlatform] = useState<'all' | 'twitter' | 'linkedin'>('all');

  // Data state
  const [data, setData] = useState<{
    trends: Trend[];
    posts: Post[];
    postTrends: PostTrend[];
    trendLinks: TrendLink[];
  }>({ trends: [], posts: [], postTrends: [], trendLinks: [] });
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const result = await fetchAllData();
        setData(result);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let filtered = data.posts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.search_term.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Platform filter
    if (filterPlatform !== 'all') {
      filtered = filtered.filter(post => {
        if (filterPlatform === 'twitter') return post.twitter_url && post.twitter_url !== '';
        if (filterPlatform === 'linkedin') return !post.twitter_url || post.twitter_url === '';
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'engagement':
          return calculateEngagementScore(b) - calculateEngagementScore(a);
        case 'alphabet':
          return a.text.localeCompare(b.text);
        default:
          return 0;
      }
    });

    return filtered;
  }, [data.posts, searchTerm, sortBy, filterPlatform]);

  // Filter and sort trends
  const filteredTrends = useMemo(() => {
    let filtered = data.trends;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(trend =>
        trend.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trend.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trend.alt_names.some(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'alphabet':
          return a.label.localeCompare(b.label);
        default:
          return 0;
      }
    });

    return filtered;
  }, [data.trends, searchTerm, sortBy]);

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getPostsForTrend = (trendId: string) => {
    const relatedPostTrends = data.postTrends.filter(pt => pt.trend_id === trendId);
    return relatedPostTrends.map(pt => {
      const post = data.posts.find(p => p.post_id === pt.post_id);
      return post;
    }).filter(Boolean) as Post[];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data showcase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Data Showcase
              </h1>
              <p className="mt-2 text-gray-600">
                Complete view of all trends and social posts in the database
              </p>
            </div>
            <a
              href="/"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-2xl font-bold text-blue-600">{data.trends.length}</div>
            <div className="text-gray-600">Total Trends</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-2xl font-bold text-green-600">{data.posts.length}</div>
            <div className="text-gray-600">Total Posts</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-2xl font-bold text-purple-600">{data.postTrends.length}</div>
            <div className="text-gray-600">Post-Trend Links</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-2xl font-bold text-orange-600">
              {formatNumber(data.posts.reduce((sum, post) => sum + calculateEngagementScore(post), 0))}
            </div>
            <div className="text-gray-600">Total Engagement</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'posts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Posts ({data.posts.length})
              </button>
              <button
                onClick={() => setActiveTab('trends')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'trends'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Trends ({data.trends.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg p-4 shadow">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={activeTab === 'posts' ? 'Search posts...' : 'Search trends...'}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date">Date</option>
                {activeTab === 'posts' && <option value="engagement">Engagement</option>}
                <option value="alphabet">Alphabetical</option>
              </select>
            </div>
            {activeTab === 'posts' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <select
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value as any)}
                  className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Platforms</option>
                  <option value="twitter">Twitter</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'posts' ? (
          // Posts View
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                All Posts ({filteredPosts.length} {filteredPosts.length !== data.posts.length && `of ${data.posts.length}`})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredPosts.map((post) => {
                const engagement = calculateEngagementScore(post);
                const platform = post.twitter_url && post.twitter_url !== '' ? 'Twitter' : 'LinkedIn';
                return (
                  <div key={post.post_id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          platform === 'Twitter' ? 'bg-blue-100 text-blue-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {platform}
                        </span>
                        <span className="text-xs text-gray-500">
                          Search: {post.search_term}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(post.created_at)}
                      </div>
                    </div>
                    <p className="text-gray-900 mb-3 leading-relaxed">
                      {post.text}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <span>👍 {formatNumber(post.like_count)}</span>
                        <span>🔄 {formatNumber(post.retweet_count)}</span>
                        <span>💬 {formatNumber(post.reply_count)}</span>
                        <span>📖 {formatNumber(post.bookmark_count)}</span>
                      </div>
                      <div className="font-medium text-gray-900">
                        Total Engagement: {formatNumber(engagement)}
                      </div>
                    </div>
                    {post.url && (
                      <div className="mt-2">
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View original post →
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredPosts.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No posts match your current filters
                </div>
              )}
            </div>
          </div>
        ) : (
          // Trends View
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                All Trends ({filteredTrends.length} {filteredTrends.length !== data.trends.length && `of ${data.trends.length}`})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredTrends.map((trend) => {
                const trendPosts = getPostsForTrend(trend.trend_id);
                const totalEngagement = trendPosts.reduce((sum, post) => sum + calculateEngagementScore(post), 0);
                return (
                  <div key={trend.trend_id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {trend.label}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Slug: {trend.slug}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {trendPosts.length} posts
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(trend.created_at)}
                        </div>
                      </div>
                    </div>

                    {trend.alt_names.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">Alternative names:</div>
                        <div className="flex flex-wrap gap-1">
                          {trend.alt_names.map((name, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          trend.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {trend.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {trend.brief_url && (
                          <span className="text-blue-600">📄 Brief Available</span>
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        Total Engagement: {formatNumber(totalEngagement)}
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredTrends.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No trends match your current filters
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}