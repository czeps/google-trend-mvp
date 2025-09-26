import { useState, useEffect } from 'react';
import { TrendMetrics, Post } from '@/lib/types';

interface MarketingBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  trendMetric: TrendMetrics;
  allPosts: Post[];
  onGenerationStart?: () => void;
  onGenerationComplete?: (briefId: string) => void;
}

interface BriefFormData {
  // Core
  campaign_name: string;
  trend_id: string;
  selected_posts: string[];

  // Goal & measurement
  objective: string;
  primary_kpi: string;
  kpi_target_value: number;
  kpi_target_unit: string;
  measurement_window_start: string;
  measurement_window_end: string;

  // Audience
  regions: string[];
  languages: string[];

  // Timing
  launch_start_date: string;
  cadence: string;

  // Budget
  budget_total: number;
  paid_media: boolean;
  creator_allowance: number;

  // Rights & safety
  reuse_rights_by_post: Record<string, boolean>;
  ai_disclosure_required: boolean;
  sensitive_topics_to_avoid: string;

  // Mandatories
  brand_guidelines_url: string;
  required_cta_text: string;
  required_hashtags: string[];
  legal_disclaimer: string;

  // Tracking
  landing_url: string;

  // Governance
  project_lead: string;
  approver: string;
  reviewers: string[];
}

const OBJECTIVES = [
  { value: 'awareness', label: 'Awareness' },
  { value: 'consideration', label: 'Consideration' },
  { value: 'conversion', label: 'Conversion' },
  { value: 'community', label: 'Community' }
];

const PRIMARY_KPIS = [
  { value: 'reach', label: 'Reach' },
  { value: 'engagement_rate', label: 'Engagement Rate' },
  { value: 'ctr', label: 'CTR' },
  { value: 'signups', label: 'Sign-ups' },
  { value: 'prompt_downloads', label: 'Prompt Downloads' },
  { value: 'trials', label: 'Trials' }
];

const KPI_UNITS = [
  { value: 'percentage', label: '%' },
  { value: 'count', label: 'Count' },
  { value: 'rate', label: 'Rate' }
];

const REGIONS = [
  { value: 'NA', label: 'North America' },
  { value: 'EU', label: 'Europe' },
  { value: 'APAC', label: 'Asia Pacific' },
  { value: 'LATAM', label: 'Latin America' },
  { value: 'custom', label: 'Custom' }
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese' }
];

const CADENCES = [
  { value: 'one-off', label: 'One-off' },
  { value: '1-week', label: '1 Week' },
  { value: '2-week', label: '2 Weeks' }
];

export default function MarketingBriefModal({
  isOpen,
  onClose,
  trendMetric,
  allPosts,
  onGenerationStart,
  onGenerationComplete
}: MarketingBriefModalProps) {
  const [formData, setFormData] = useState<BriefFormData>({
    campaign_name: `${trendMetric.trend.label} Campaign`,
    trend_id: trendMetric.trend_id,
    selected_posts: [], // No posts selected by default
    objective: '',
    primary_kpi: '',
    kpi_target_value: 0,
    kpi_target_unit: '',
    measurement_window_start: '',
    measurement_window_end: '',
    regions: [],
    languages: ['en'],
    launch_start_date: '',
    cadence: 'one-off',
    budget_total: 0,
    paid_media: false,
    creator_allowance: 0,
    reuse_rights_by_post: {},
    ai_disclosure_required: false,
    sensitive_topics_to_avoid: '',
    brand_guidelines_url: '',
    required_cta_text: '',
    required_hashtags: [],
    legal_disclaimer: '',
    landing_url: '',
    project_lead: '',
    approver: '',
    reviewers: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hashtagInput, setHashtagInput] = useState('');
  const [reviewerInput, setReviewerInput] = useState('');
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [isDirectPostsExpanded, setIsDirectPostsExpanded] = useState(false);
  const [isRelatedPostsExpanded, setIsRelatedPostsExpanded] = useState(false);

  // Initialize default measurement window (30 days from today)
  useEffect(() => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 30);

    setFormData(prev => ({
      ...prev,
      measurement_window_start: today.toISOString().split('T')[0],
      measurement_window_end: endDate.toISOString().split('T')[0],
      launch_start_date: today.toISOString().split('T')[0]
    }));
  }, []);

  // Get posts directly related to this trend (from post_trends table)
  const directTrendPosts = trendMetric.posts;
  const directPostIds = new Set(directTrendPosts.map(p => p.post_id));

  // Find additional posts that mention the trend or related keywords
  const trendKeywords = [
    trendMetric.trend.label.toLowerCase(),
    ...trendMetric.trend.slug.split('-'),
    // Add more keywords based on trend description if available
  ].filter(Boolean);

  const relatedPosts = allPosts.filter(post => {
    // Skip if already directly related to trend
    if (directPostIds.has(post.post_id)) return false;

    const postText = post.text.toLowerCase();

    // Check if post contains trend keywords
    return trendKeywords.some(keyword =>
      postText.includes(keyword) ||
      // Check for similar engagement patterns (similar hashtags, mentions, etc.)
      postText.split(/\s+/).some(word =>
        word.length > 3 && keyword.includes(word.replace(/[^a-z]/g, ''))
      )
    );
  }).slice(0, 20); // Limit to 20 additional posts to keep UI manageable

  // Combine direct and related posts
  const relevantPosts = [
    ...directTrendPosts,
    ...relatedPosts
  ];

  const handleInputChange = (field: keyof BriefFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelectChange = (field: keyof BriefFormData, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter(item => item !== value)
    }));
  };

  const handlePostSelectionChange = (postId: string, checked: boolean) => {
    setFormData(prev => {
      const newReuseRights = { ...prev.reuse_rights_by_post };
      if (checked) {
        newReuseRights[postId] = false; // Default to false for reuse rights
      } else {
        delete newReuseRights[postId]; // Remove the key when unchecked
      }

      return {
        ...prev,
        selected_posts: checked
          ? [...prev.selected_posts, postId]
          : prev.selected_posts.filter(id => id !== postId),
        reuse_rights_by_post: newReuseRights
      };
    });
  };

  const addHashtag = () => {
    if (hashtagInput.trim()) {
      const hashtag = hashtagInput.startsWith('#') ? hashtagInput : `#${hashtagInput}`;
      setFormData(prev => ({
        ...prev,
        required_hashtags: [...prev.required_hashtags, hashtag]
      }));
      setHashtagInput('');
    }
  };

  const removeHashtag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      required_hashtags: prev.required_hashtags.filter((_, i) => i !== index)
    }));
  };

  const addReviewer = () => {
    if (reviewerInput.trim() && formData.reviewers.length < 3) {
      setFormData(prev => ({
        ...prev,
        reviewers: [...prev.reviewers, reviewerInput.trim()]
      }));
      setReviewerInput('');
    }
  };

  const removeReviewer = (index: number) => {
    setFormData(prev => ({
      ...prev,
      reviewers: prev.reviewers.filter((_, i) => i !== index)
    }));
  };

  const togglePostExpansion = (postId: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Generate unique brief ID
    const briefId = `brief_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Notify parent that generation is starting
    onGenerationStart?.();

    try {
      // Prepare data for Make.com webhook
      const webhookData = {
        ...formData,
        brief_id: briefId,
        trend_name: trendMetric.trend.label,
        trend_slug: trendMetric.trend.slug,
        selected_post_details: formData.selected_posts.map(postId => {
          const post = relevantPosts.find(p => p.post_id === postId);
          return {
            post_id: postId,
            url: post?.url,
            text: post?.text,
            engagement_score: post?.engagement_score
          };
        }),
        total_trend_engagement: trendMetric.total_engagement,
        trend_status: trendMetric.status,
        wow_growth_pct: trendMetric.wow_growth_pct,
        created_at: new Date().toISOString()
      };

      // Send to Make.com webhook
      const response = await fetch('https://hook.eu2.make.com/anbwqfr6w2p83hr9ymug9vfy4qmn62tv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });

      if (response.ok) {
        // Brief submission successful - now we wait for polling to detect the PDF
        console.log('Brief generation request submitted successfully');

        // Notify parent that generation has started (triggers polling)
        onGenerationComplete?.(briefId);

        // Close the modal
        onClose();
      } else {
        throw new Error('Failed to submit brief');
      }
    } catch (error) {
      console.error('Error submitting brief:', error);
      alert('Failed to submit marketing brief. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b bg-white rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-900">
            Generate Marketing Brief: {trendMetric.trend.label}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form id="marketing-brief-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
          {/* Core Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b pb-2">Core</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name *</label>
                <input
                  type="text"
                  value={formData.campaign_name}
                  onChange={(e) => handleInputChange('campaign_name', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trend</label>
                <input
                  type="text"
                  value={trendMetric.trend.label}
                  disabled
                  className="w-full p-2 border rounded bg-gray-100"
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-900">
                      Post Selection
                    </label>
                    <p className="text-xs text-gray-600">
                      {formData.selected_posts.length} of {relevantPosts.length} posts selected
                      {formData.selected_posts.length > 0 &&
                        ` (${directTrendPosts.filter(p => formData.selected_posts.includes(p.post_id)).length} primary,
                        ${relatedPosts.filter(p => formData.selected_posts.includes(p.post_id)).length} related)`
                      }
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const allPostIds = relevantPosts.map(p => p.post_id);
                        setFormData(prev => ({ ...prev, selected_posts: allPostIds }));
                      }}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const directPostIds = directTrendPosts.map(p => p.post_id);
                        setFormData(prev => ({ ...prev, selected_posts: directPostIds }));
                      }}
                      className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Primary
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, selected_posts: [] }));
                      }}
                      className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct Trend Posts */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setIsDirectPostsExpanded(!isDirectPostsExpanded)}
                  className="flex items-center justify-between w-full text-left mb-2 p-2 rounded hover:bg-blue-50 transition-colors"
                >
                  <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                    Direct Trend Posts ({directTrendPosts.length})
                    {formData.selected_posts.filter(id => directTrendPosts.some(p => p.post_id === id)).length > 0 &&
                      ` • ${formData.selected_posts.filter(id => directTrendPosts.some(p => p.post_id === id)).length} selected`
                    }
                  </h4>
                  <svg
                    className={`w-4 h-4 transition-transform ${isDirectPostsExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isDirectPostsExpanded && (
                  <div className="border rounded p-3 space-y-3 bg-blue-50">
                  {directTrendPosts.map(post => {
                    const isExpanded = expandedPosts.has(post.post_id);
                    const isSelected = formData.selected_posts.includes(post.post_id);
                    return (
                      <div key={post.post_id} className={`border rounded-lg p-3 bg-white ${isSelected ? 'ring-2 ring-blue-400' : ''}`}>
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handlePostSelectionChange(post.post_id, e.target.checked)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded">Primary</span>
                              <button
                                type="button"
                                onClick={() => togglePostExpansion(post.post_id)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                {isExpanded ? 'Show Less' : 'Show More'}
                              </button>
                            </div>
                            <p className="text-sm text-gray-800 leading-relaxed">
                              {isExpanded ? post.text : `${post.text.substring(0, 150)}${post.text.length > 150 ? '...' : ''}`}
                            </p>
                            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                              <span>Engagement: {post.engagement_score}</span>
                              <span>{formatDate(post.created_at)}</span>
                            </div>
                            {post.url && (
                              <a
                                href={post.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
                              >
                                View original →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                )}
              </div>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setIsRelatedPostsExpanded(!isRelatedPostsExpanded)}
                    className="flex items-center justify-between w-full text-left mb-2 p-2 rounded hover:bg-green-50 transition-colors"
                  >
                    <h4 className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                      Related Posts ({relatedPosts.length})
                      {formData.selected_posts.filter(id => relatedPosts.some(p => p.post_id === id)).length > 0 &&
                        ` • ${formData.selected_posts.filter(id => relatedPosts.some(p => p.post_id === id)).length} selected`
                      }
                    </h4>
                    <svg
                      className={`w-4 h-4 transition-transform ${isRelatedPostsExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isRelatedPostsExpanded && (
                    <div className="border rounded p-3 space-y-3 bg-green-50">
                    {relatedPosts
                      .sort((a, b) => (b.engagement_score || 0) - (a.engagement_score || 0))
                      .map(post => {
                        const isExpanded = expandedPosts.has(post.post_id);
                        const isSelected = formData.selected_posts.includes(post.post_id);
                        return (
                          <div key={post.post_id} className={`border rounded-lg p-3 bg-white ${isSelected ? 'ring-2 ring-green-400' : ''}`}>
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => handlePostSelectionChange(post.post_id, e.target.checked)}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded">Related</span>
                                  <button
                                    type="button"
                                    onClick={() => togglePostExpansion(post.post_id)}
                                    className="text-xs text-green-600 hover:text-green-800"
                                  >
                                    {isExpanded ? 'Show Less' : 'Show More'}
                                  </button>
                                </div>
                                <p className="text-sm text-gray-800 leading-relaxed">
                                  {isExpanded ? post.text : `${post.text.substring(0, 150)}${post.text.length > 150 ? '...' : ''}`}
                                </p>
                                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                                  <span>Engagement: {post.engagement_score || 0}</span>
                                  <span>{formatDate(post.created_at)}</span>
                                </div>
                                {post.url && (
                                  <a
                                    href={post.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-green-600 hover:text-green-800 mt-1 inline-block"
                                  >
                                    View original →
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Goal & Measurement Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b pb-2">Goal & Measurement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Objective *</label>
                <select
                  value={formData.objective}
                  onChange={(e) => handleInputChange('objective', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  required
                >
                  <option value="">Select objective</option>
                  {OBJECTIVES.map(obj => (
                    <option key={obj.value} value={obj.value}>{obj.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary KPI *</label>
                <select
                  value={formData.primary_kpi}
                  onChange={(e) => handleInputChange('primary_kpi', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  required
                >
                  <option value="">Select KPI</option>
                  {PRIMARY_KPIS.map(kpi => (
                    <option key={kpi.value} value={kpi.value}>{kpi.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">KPI Target Value</label>
                <input
                  type="number"
                  value={formData.kpi_target_value}
                  onChange={(e) => handleInputChange('kpi_target_value', Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">KPI Unit</label>
                <select
                  value={formData.kpi_target_unit}
                  onChange={(e) => handleInputChange('kpi_target_unit', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                >
                  <option value="">Select unit</option>
                  {KPI_UNITS.map(unit => (
                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Measurement Start Date</label>
                <input
                  type="date"
                  value={formData.measurement_window_start}
                  onChange={(e) => handleInputChange('measurement_window_start', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Measurement End Date</label>
                <input
                  type="date"
                  value={formData.measurement_window_end}
                  onChange={(e) => handleInputChange('measurement_window_end', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                />
              </div>
            </div>
          </section>

          {/* Audience Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b pb-2">Audience</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Regions</label>
                <div className="space-y-2 border rounded p-2">
                  {REGIONS.map(region => (
                    <label key={region.value} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.regions.includes(region.value)}
                        onChange={(e) => handleMultiSelectChange('regions', region.value, e.target.checked)}
                      />
                      {region.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                <div className="space-y-2 border rounded p-2">
                  {LANGUAGES.map(lang => (
                    <label key={lang.value} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.languages.includes(lang.value)}
                        onChange={(e) => handleMultiSelectChange('languages', lang.value, e.target.checked)}
                      />
                      {lang.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Timing Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b pb-2">Timing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Launch Start Date</label>
                <input
                  type="date"
                  value={formData.launch_start_date}
                  onChange={(e) => handleInputChange('launch_start_date', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cadence</label>
                <select
                  value={formData.cadence}
                  onChange={(e) => handleInputChange('cadence', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                >
                  {CADENCES.map(cadence => (
                    <option key={cadence.value} value={cadence.value}>{cadence.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Budget Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b pb-2">Budget</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Budget ($)</label>
                <input
                  type="number"
                  value={formData.budget_total}
                  onChange={(e) => handleInputChange('budget_total', Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Creator Allowance ($)</label>
                <input
                  type="number"
                  value={formData.creator_allowance}
                  onChange={(e) => handleInputChange('creator_allowance', Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.paid_media}
                    onChange={(e) => handleInputChange('paid_media', e.target.checked)}
                  />
                  <span className="text-sm font-medium">Include Paid Media</span>
                </label>
              </div>
            </div>
          </section>

          {/* Rights & Safety Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b pb-2">Rights & Safety</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.ai_disclosure_required}
                    onChange={(e) => handleInputChange('ai_disclosure_required', e.target.checked)}
                  />
                  <span className="text-sm font-medium">AI Disclosure Required</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sensitive Topics to Avoid</label>
                <textarea
                  value={formData.sensitive_topics_to_avoid}
                  onChange={(e) => handleInputChange('sensitive_topics_to_avoid', e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                />
              </div>
            </div>
          </section>

          {/* Mandatories Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b pb-2">Mandatories</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand Guidelines URL</label>
                <input
                  type="url"
                  value={formData.brand_guidelines_url}
                  onChange={(e) => handleInputChange('brand_guidelines_url', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required CTA Text</label>
                <input
                  type="text"
                  value={formData.required_cta_text}
                  onChange={(e) => handleInputChange('required_cta_text', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required Hashtags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                    placeholder="Enter hashtag"
                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={addHashtag}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.required_hashtags.map((hashtag, index) => (
                    <span key={index} className="bg-blue-100 px-2 py-1 rounded text-sm flex items-center gap-1">
                      {hashtag}
                      <button
                        type="button"
                        onClick={() => removeHashtag(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Legal Disclaimer</label>
                <textarea
                  value={formData.legal_disclaimer}
                  onChange={(e) => handleInputChange('legal_disclaimer', e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                />
              </div>
            </div>
          </section>

          {/* Tracking Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b pb-2">Tracking</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Landing URL</label>
              <input
                type="url"
                value={formData.landing_url}
                onChange={(e) => handleInputChange('landing_url', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
            </div>
          </section>

          {/* Governance Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b pb-2">Governance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Lead *</label>
                <input
                  type="text"
                  value={formData.project_lead}
                  onChange={(e) => handleInputChange('project_lead', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Approver *</label>
                <input
                  type="text"
                  value={formData.approver}
                  onChange={(e) => handleInputChange('approver', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Reviewers (2-3 names)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={reviewerInput}
                  onChange={(e) => setReviewerInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addReviewer())}
                  placeholder="Enter reviewer name"
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  disabled={formData.reviewers.length >= 3}
                />
                <button
                  type="button"
                  onClick={addReviewer}
                  disabled={formData.reviewers.length >= 3}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.reviewers.map((reviewer, index) => (
                  <span key={index} className="bg-green-100 px-2 py-1 rounded text-sm flex items-center gap-1">
                    {reviewer}
                    <button
                      type="button"
                      onClick={() => removeReviewer(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </section>
          </div>
        </form>

        {/* Submit Button - Fixed at bottom */}
        <div className="border-t bg-white px-6 py-4 rounded-b-lg">
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="marketing-brief-form"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Generating Brief...' : 'Generate Marketing Brief'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}