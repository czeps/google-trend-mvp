export interface Post {
  post_id: string;
  url: string;
  twitter_url: string;
  text: string;
  created_at: string;
  created_at_raw?: string;
  search_term: string;
  retweet_count: number;
  reply_count: number;
  like_count: number;
  quote_count: number;
  bookmark_count: number;
  is_retweet: boolean;
  is_quote: boolean;
  engagement_score: number;
  inserted_at: string;
}

export interface Trend {
  trend_id: string;
  slug: string;
  label: string;
  is_active: boolean;
  alt_names: string[];
  created_at: string;
}

export interface PostTrend {
  post_id: string;
  trend_id: string;
  method?: string;
  confidence?: number;
  raw_label?: string;
  normalized_label?: string;
  created_at: string;
}

export interface TrendMetrics {
  trend_id: string;
  trend: Trend;
  posts: Post[];
  total_engagement: number;
  wow_growth_pct: number;
  status: 'Emerging' | 'Stable' | 'Declining';
  first_seen: string;
  last_seen: string;
}

export interface DatePreset {
  label: string;
  value: number;
}

export interface DashboardFilters {
  search_terms: string[];
  date_preset: number;
  min_engagement: number;
}

export interface KPIData {
  active_trends: number;
  eligible_posts: number;
  total_engagement: number;
  new_trends: number;
}