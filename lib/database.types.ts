export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          post_id: string;
          url: string;
          twitter_url: string;
          text: string;
          created_at: string;
          created_at_raw?: string;
          retweet_count: number;
          reply_count: number;
          like_count: number;
          quote_count: number;
          bookmark_count: number;
          is_retweet: boolean;
          is_quote: boolean;
          engagement_score: number;
          inserted_at: string;
          search_term: string;
        };
        Insert: {
          post_id?: string;
          url: string;
          twitter_url: string;
          text: string;
          created_at: string;
          created_at_raw?: string;
          retweet_count?: number;
          reply_count?: number;
          like_count?: number;
          quote_count?: number;
          bookmark_count?: number;
          is_retweet?: boolean;
          is_quote?: boolean;
          engagement_score?: number;
          inserted_at?: string;
          search_term: string;
        };
        Update: {
          post_id?: string;
          url?: string;
          twitter_url?: string;
          text?: string;
          created_at?: string;
          created_at_raw?: string;
          retweet_count?: number;
          reply_count?: number;
          like_count?: number;
          quote_count?: number;
          bookmark_count?: number;
          is_retweet?: boolean;
          is_quote?: boolean;
          engagement_score?: number;
          inserted_at?: string;
          search_term?: string;
        };
      };
      trends: {
        Row: {
          trend_id: string;
          slug: string;
          label: string;
          is_active: boolean;
          alt_names: string[];
          created_at: string;
        };
        Insert: {
          trend_id?: string;
          slug: string;
          label: string;
          is_active?: boolean;
          alt_names?: string[];
          created_at?: string;
        };
        Update: {
          trend_id?: string;
          slug?: string;
          label?: string;
          is_active?: boolean;
          alt_names?: string[];
          created_at?: string;
        };
      };
      post_trends: {
        Row: {
          trend_id: string;
          post_id: string;
          method?: string;
          confidence?: number;
          raw_label?: string;
          normalized_label?: string;
          created_at: string;
        };
        Insert: {
          trend_id: string;
          post_id: string;
          method?: string;
          confidence?: number;
          raw_label?: string;
          normalized_label?: string;
          created_at?: string;
        };
        Update: {
          trend_id?: string;
          post_id?: string;
          method?: string;
          confidence?: number;
          raw_label?: string;
          normalized_label?: string;
          created_at?: string;
        };
      };
    };
  };
};