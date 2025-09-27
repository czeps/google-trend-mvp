import { Trend, Post, PostTrend, TrendLink } from '@/lib/types';

export const trends: Trend[] = [
  {
    trend_id: '1',
    slug: 'ai-code-generation',
    label: 'AI Code Generation',
    is_active: true,
    alt_names: ['ai code', 'codegen', 'github copilot'],
    created_at: '2024-09-01T00:00:00Z',
    brief_url: 'https://example.com/marketing-brief-trend-1.pdf'
  },
  {
    trend_id: '2',
    slug: 'ai-customer-support',
    label: 'AI Customer Support',
    is_active: true,
    alt_names: ['ai chatbot', 'customer support ai', 'automated support'],
    created_at: '2024-09-05T00:00:00Z',
    brief_url: 'https://example.com/marketing-brief-trend-2.pdf'
  },
  {
    trend_id: '3',
    slug: 'ai-content-creation',
    label: 'AI Content Creation',
    is_active: true,
    alt_names: ['ai writing', 'ai design', 'content generation'],
    created_at: '2024-09-10T00:00:00Z',
    brief_url: undefined
  }
];

export const posts: Post[] = [
  {
    post_id: 'tweet1',
    url: 'https://twitter.com/developer1/status/1234567890',
    twitter_url: 'https://twitter.com/developer1/status/1234567890',
    text: 'Just discovered GitHub Copilot and it\'s revolutionizing how I write code! #AI #coding',
    created_at: '2024-09-20T10:00:00Z',
    search_term: 'ai code',
    retweet_count: 23,
    reply_count: 8,
    like_count: 145,
    quote_count: 5,
    bookmark_count: 12,
    is_retweet: false,
    is_quote: false,
    engagement_score: 0,
    inserted_at: '2024-09-20T10:05:00Z'
  },
  {
    post_id: 'post1',
    url: 'https://linkedin.com/posts/johnsmith_ai-chatbot-support',
    twitter_url: '',
    text: 'Our company just implemented AI customer support and saw 40% faster response times',
    created_at: '2024-09-19T14:30:00Z',
    search_term: 'ai chatbot',
    retweet_count: 15,
    reply_count: 22,
    like_count: 89,
    quote_count: 3,
    bookmark_count: 7,
    is_retweet: false,
    is_quote: false,
    engagement_score: 0,
    inserted_at: '2024-09-19T14:35:00Z'
  },
  {
    post_id: 'tweet2',
    url: 'https://twitter.com/contentcreator/status/1234567891',
    twitter_url: 'https://twitter.com/contentcreator/status/1234567891',
    text: 'AI writing tools are getting scary good. Just wrote a whole blog post in 10 minutes!',
    created_at: '2024-09-18T09:15:00Z',
    search_term: 'ai writing',
    retweet_count: 45,
    reply_count: 18,
    like_count: 234,
    quote_count: 8,
    bookmark_count: 31,
    is_retweet: false,
    is_quote: false,
    engagement_score: 0,
    inserted_at: '2024-09-18T09:20:00Z'
  },
  {
    post_id: 'tweet3',
    url: 'https://twitter.com/businessowner/status/1234567892',
    twitter_url: 'https://twitter.com/businessowner/status/1234567892',
    text: 'Anyone else using AI for customer support? The automation is incredible',
    created_at: '2024-09-17T16:45:00Z',
    search_term: 'customer support ai',
    retweet_count: 12,
    reply_count: 15,
    like_count: 67,
    quote_count: 2,
    bookmark_count: 5,
    is_retweet: false,
    is_quote: false,
    engagement_score: 0,
    inserted_at: '2024-09-17T16:50:00Z'
  },
  {
    post_id: 'post2',
    url: 'https://linkedin.com/posts/techleader_ai-code-generation',
    twitter_url: '',
    text: 'The future of software development is here with AI code generation tools',
    created_at: '2024-09-16T11:20:00Z',
    search_term: 'codegen',
    retweet_count: 28,
    reply_count: 12,
    like_count: 156,
    quote_count: 4,
    bookmark_count: 19,
    is_retweet: false,
    is_quote: false,
    engagement_score: 0,
    inserted_at: '2024-09-16T11:25:00Z'
  }
];

export const postTrends: PostTrend[] = [
  {
    post_id: 'tweet1',
    trend_id: '1',
    method: 'keyword_match',
    confidence: 0.95,
    raw_label: 'ai code',
    normalized_label: 'AI Code Generation',
    created_at: '2024-09-20T10:00:00Z'
  },
  {
    post_id: 'post1',
    trend_id: '2',
    method: 'keyword_match',
    confidence: 0.88,
    raw_label: 'ai chatbot',
    normalized_label: 'AI Customer Support',
    created_at: '2024-09-19T14:30:00Z'
  },
  {
    post_id: 'tweet2',
    trend_id: '3',
    method: 'keyword_match',
    confidence: 0.92,
    raw_label: 'ai writing',
    normalized_label: 'AI Content Creation',
    created_at: '2024-09-18T09:15:00Z'
  },
  {
    post_id: 'tweet3',
    trend_id: '2',
    method: 'keyword_match',
    confidence: 0.85,
    raw_label: 'customer support ai',
    normalized_label: 'AI Customer Support',
    created_at: '2024-09-17T16:45:00Z'
  },
  {
    post_id: 'post2',
    trend_id: '1',
    method: 'keyword_match',
    confidence: 0.90,
    raw_label: 'codegen',
    normalized_label: 'AI Code Generation',
    created_at: '2024-09-16T11:20:00Z'
  }
];

// Mock trend_links data - represents the actual marketing brief PDFs
export const trendLinks: TrendLink[] = [
  {
    trend_id: '1',
    url: 'https://storage.googleapis.com/marketing-briefs/ai-code-generation-brief.pdf',
    label: 'AI Code Generation Marketing Brief',
    created_at: '2024-09-21T12:00:00Z'
  },
  {
    trend_id: '2',
    url: 'https://storage.googleapis.com/marketing-briefs/ai-customer-support-brief.pdf',
    label: 'AI Customer Support Marketing Brief',
    created_at: '2024-09-21T13:30:00Z'
  }
];